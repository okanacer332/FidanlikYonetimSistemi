package com.fidanlik.fidanysserver.reporting.service;

import com.fidanlik.fidanysserver.customer.model.Customer;
import com.fidanlik.fidanysserver.customer.repository.CustomerRepository;
import com.fidanlik.fidanysserver.fidan.model.Plant;
import com.fidanlik.fidanysserver.fidan.model.ProductionBatch;
import com.fidanlik.fidanysserver.fidan.repository.PlantRepository;
import com.fidanlik.fidanysserver.fidan.repository.ProductionBatchRepository;
import com.fidanlik.fidanysserver.goodsreceipt.model.GoodsReceipt;
import com.fidanlik.fidanysserver.goodsreceipt.model.GoodsReceiptItem;
import com.fidanlik.fidanysserver.goodsreceipt.repository.GoodsReceiptRepository;
import com.fidanlik.fidanysserver.order.model.Order;
import com.fidanlik.fidanysserver.order.repository.OrderRepository;
import com.fidanlik.fidanysserver.reporting.dto.CustomerSalesReport;
import com.fidanlik.fidanysserver.reporting.dto.OverviewReportDto;
import com.fidanlik.fidanysserver.reporting.dto.ProfitabilityReportDto;
import com.fidanlik.fidanysserver.reporting.dto.TopSellingPlantReport;
import com.fidanlik.fidanysserver.stock.model.StockMovement;
import com.fidanlik.fidanysserver.stock.repository.StockRepository;
import com.fidanlik.fidanysserver.stock.repository.StockMovementRepository;
import com.fidanlik.fidanysserver.common.service.InflationService;
import com.fidanlik.fidanysserver.expense.model.Expense;
import com.fidanlik.fidanysserver.expense.repository.ExpenseRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportingService {

    private final MongoTemplate mongoTemplate;
    private final PlantRepository plantRepository;
    private final CustomerRepository customerRepository;
    private final StockRepository stockRepository;
    private final OrderRepository orderRepository;

    // YENİ ENJEKTE EDİLEN BAĞIMLILIKLAR
    private final GoodsReceiptRepository goodsReceiptRepository;
    private final ExpenseRepository expenseRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ProductionBatchRepository productionBatchRepository;
    private final InflationService inflationService;

    @Data private static class PlantSaleResult { String plantId; int totalQuantitySold; }
    @Data private static class CustomerSaleResult { String customerId; BigDecimal totalSalesAmount; int orderCount; }
    @Data private static class TotalSalesResult { BigDecimal totalSales; }
    @Data private static class AggregationResult {
        private String plantId;
        private int totalQuantitySold;
        private BigDecimal totalRevenue;
    }
    @Data private static class CostAggregationResult {
        private String plantId;
        private BigDecimal averageCost;
    }

    public OverviewReportDto getDashboardOverview(String tenantId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        Criteria dateCriteria = Criteria.where("orderDate").gte(startDateTime).lte(endDateTime);
        Criteria deliveredStatusCriteria = Criteria.where("status").is(Order.OrderStatus.DELIVERED);
        Criteria tenantCriteria = Criteria.where("tenantId").is(tenantId);

        Aggregation salesAggregation = Aggregation.newAggregation(
                Aggregation.match(new Criteria().andOperator(tenantCriteria, deliveredStatusCriteria, dateCriteria)),
                Aggregation.unwind("items"),
                Aggregation.group().sum(
                        ArithmeticOperators.Multiply.valueOf(
                                ConvertOperators.ToDecimal.toDecimal(ConditionalOperators.ifNull("items.quantity").then(0))
                        ).multiplyBy(
                                ConvertOperators.ToDecimal.toDecimal(ConditionalOperators.ifNull("items.salePrice").then(BigDecimal.ZERO))
                        )
                ).as("totalSales")
        );
        AggregationResults<TotalSalesResult> salesResult = mongoTemplate.aggregate(salesAggregation, Order.class, TotalSalesResult.class);
        BigDecimal totalSales = salesResult.getUniqueMappedResult() != null ? salesResult.getUniqueMappedResult().getTotalSales() : BigDecimal.ZERO;

        List<ProfitabilityReportDto> profitabilityData = getProfitabilityReport(tenantId, startDate, endDate);
        BigDecimal netProfit = profitabilityData.stream().map(ProfitabilityReportDto::getRealProfit).reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = mongoTemplate.count(new org.springframework.data.mongodb.core.query.Query(new Criteria().andOperator(tenantCriteria, dateCriteria)), Order.class);

        Criteria customerDateCriteria = Criteria.where("createdAt").gte(startDateTime).lte(endDateTime);
        long newCustomers = mongoTemplate.count(new org.springframework.data.mongodb.core.query.Query(new Criteria().andOperator(tenantCriteria, customerDateCriteria)), Customer.class);

        return OverviewReportDto.builder()
                .totalSales(totalSales)
                .netProfit(netProfit)
                .totalOrders(totalOrders)
                .newCustomers(newCustomers)
                .build();
    }

    public List<TopSellingPlantReport> getTopSellingPlants(String tenantId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        Aggregation plantAggregation = Aggregation.newAggregation(
                Aggregation.match(new Criteria().andOperator(
                        Criteria.where("tenantId").is(tenantId),
                        Criteria.where("status").is(Order.OrderStatus.DELIVERED),
                        Criteria.where("orderDate").gte(startDateTime).lte(endDateTime)
                )),
                Aggregation.unwind("items"),
                Aggregation.group("items.plantId").sum("items.quantity").as("totalQuantitySold"),
                Aggregation.sort(Sort.Direction.DESC, "totalQuantitySold"),
                Aggregation.limit(10),
                Aggregation.project("totalQuantitySold").and("_id").as("plantId")
        );
        AggregationResults<PlantSaleResult> plantResults = mongoTemplate.aggregate(plantAggregation, Order.class, PlantSaleResult.class);
        if (plantResults.getMappedResults().isEmpty()) { return Collections.emptyList(); }
        return plantResults.getMappedResults().stream().map(result -> {
            TopSellingPlantReport report = new TopSellingPlantReport();
            plantRepository.findById(result.getPlantId()).ifPresent(plant -> {
                report.setPlantTypeName(plant.getPlantType().getName());
                report.setPlantVarietyName(plant.getPlantVariety().getName());
            });
            report.setTotalQuantitySold(result.getTotalQuantitySold());
            return report;
        }).collect(Collectors.toList());
    }

    public List<CustomerSalesReport> getCustomerSales(String tenantId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        Aggregation customerAggregation = Aggregation.newAggregation(
                Aggregation.match(new Criteria().andOperator(
                        Criteria.where("tenantId").is(tenantId),
                        Criteria.where("status").is(Order.OrderStatus.DELIVERED),
                        Criteria.where("orderDate").gte(startDateTime).lte(endDateTime)
                )),
                Aggregation.group("customerId")
                        .sum("totalAmount").as("totalSalesAmount")
                        .count().as("orderCount"),
                Aggregation.project("totalSalesAmount", "orderCount")
                        .and("_id").as("customerId"),
                Aggregation.sort(Sort.Direction.DESC, "totalSalesAmount")
        );

        AggregationResults<CustomerSaleResult> customerResults = mongoTemplate.aggregate(customerAggregation, Order.class, CustomerSaleResult.class);
        if (customerResults.getMappedResults().isEmpty()) { return Collections.emptyList(); }

        return customerResults.getMappedResults().stream().map(result -> {
            CustomerSalesReport report = new CustomerSalesReport();
            customerRepository.findById(result.getCustomerId()).ifPresent(customer -> {
                report.setCustomerFirstName(customer.getFirstName());
                report.setCustomerLastName(customer.getLastName());
            });
            report.setTotalSalesAmount(result.getTotalSalesAmount());
            report.setOrderCount(result.getOrderCount());
            return report;
        }).collect(Collectors.toList());
    }

    public OverviewReportDto getOverviewReport(String tenantId) {
        long totalCustomers = customerRepository.countByTenantId(tenantId);
        long totalOrders = orderRepository.countByTenantId(tenantId);
        long totalPlantsInStock = stockRepository.findAllByTenantId(tenantId).stream().mapToLong(stock -> (long) stock.getQuantity()).sum();
        Aggregation salesAggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("tenantId").is(tenantId).and("status").is(Order.OrderStatus.DELIVERED)),
                Aggregation.unwind("items"),
                Aggregation.group().sum(ArithmeticOperators.Multiply.valueOf(ConvertOperators.ToDecimal.toDecimal(ConditionalOperators.ifNull("items.quantity").then(0))).multiplyBy(ConvertOperators.ToDecimal.toDecimal(ConditionalOperators.ifNull("items.salePrice").then(new BigDecimal(0))))).as("totalSales")
        );
        AggregationResults<TotalSalesResult> salesResult = mongoTemplate.aggregate(salesAggregation, Order.class, TotalSalesResult.class);
        BigDecimal totalSales = salesResult.getUniqueMappedResult() != null ? salesResult.getUniqueMappedResult().getTotalSales() : BigDecimal.ZERO;
        return OverviewReportDto.builder().totalCustomers(totalCustomers).totalSales(totalSales).totalOrders(totalOrders).totalPlantsInStock(totalPlantsInStock).build();
    }

    public List<ProfitabilityReportDto> getProfitabilityReport(String tenantId, LocalDate startDate, LocalDate endDate) {
        // Tüm gerekli verileri tek seferde çekelim
        List<GoodsReceipt> allGoodsReceipts = goodsReceiptRepository.findAllByTenantId(tenantId);
        List<Expense> allExpenses = expenseRepository.findAllByTenantIdOrderByExpenseDateDesc(tenantId);
        List<ProductionBatch> allProductionBatches = productionBatchRepository.findAllByTenantId(tenantId);
        Map<String, Plant> allPlantsMap = plantRepository.findAllByTenantId(tenantId)
                .stream()
                .collect(Collectors.toMap(Plant::getId, plant -> plant));

        // Satış verilerini topla (mevcut mantıkla aynı)
        Aggregation salesAggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("tenantId").is(tenantId)
                        .and("status").is(Order.OrderStatus.DELIVERED)
                        .and("orderDate").gte(startDate.atStartOfDay()).lte(endDate.atTime(23, 59, 59))),
                Aggregation.unwind("$items"),
                Aggregation.group("$items.plantId")
                        .sum("items.quantity").as("totalQuantitySold")
                        .sum(
                                ArithmeticOperators.Multiply.valueOf(
                                        ConvertOperators.ToDecimal.toDecimal(ConditionalOperators.ifNull("$items.quantity").then(0))
                                ).multiplyBy(
                                        ConvertOperators.ToDecimal.toDecimal(ConditionalOperators.ifNull("$items.salePrice").then(new BigDecimal(0)))
                                )
                        ).as("totalRevenue"),
                Aggregation.project("totalQuantitySold", "totalRevenue").and("_id").as("plantId")
        );
        AggregationResults<AggregationResult> salesResults = mongoTemplate.aggregate(salesAggregation, Order.class, AggregationResult.class);
        Map<String, AggregationResult> salesMap = salesResults.getMappedResults().stream()
                .collect(Collectors.toMap(AggregationResult::getPlantId, result -> result));


        return salesMap.values().stream()
                .map(sale -> {
                    Plant soldPlantDefinition = allPlantsMap.get(sale.getPlantId());
                    String plantName = (soldPlantDefinition != null && soldPlantDefinition.getPlantType() != null && soldPlantDefinition.getPlantVariety() != null)
                            ? soldPlantDefinition.getPlantType().getName() + " - " + soldPlantDefinition.getPlantVariety().getName()
                            : "Bilinmeyen Fidan";

                    BigDecimal nominalCostPerUnit = BigDecimal.ZERO;
                    BigDecimal realCostPerUnit = BigDecimal.ZERO;

                    // Bu fidanın (PlantId) bir üretim partisine ait olup olmadığını anlamaya çalışalım.
                    // Plant modeli doğrudan productionBatchId tutmadığı için, PlantType ve PlantVariety ID'leri üzerinden eşleştirelim.
                    Optional<ProductionBatch> matchingBatch = Optional.empty();
                    if (soldPlantDefinition != null) {
                        matchingBatch = allProductionBatches.stream()
                                .filter(pb -> soldPlantDefinition.getPlantType() != null && pb.getPlantTypeId().equals(soldPlantDefinition.getPlantType().getId()) &&
                                        soldPlantDefinition.getPlantVariety() != null && pb.getPlantVarietyId().equals(soldPlantDefinition.getPlantVariety().getId()))
                                .findFirst(); // Birden fazla olabilir, şimdilik ilk uyanı alalım.
                    }

                    if (matchingBatch.isPresent()) {
                        // Fidan bir Üretim Partisine aitse
                        ProductionBatch batch = matchingBatch.get();

                        BigDecimal batchNominalCost = batch.getCostPool();
                        BigDecimal batchCurrentQuantity = new BigDecimal(batch.getCurrentQuantity());

                        if (batchCurrentQuantity.compareTo(BigDecimal.ZERO) > 0) {
                            nominalCostPerUnit = batchNominalCost.divide(batchCurrentQuantity, MathContext.DECIMAL128);
                        } else {
                            nominalCostPerUnit = BigDecimal.ZERO;
                        }

                        // Reel maliyet için partinin tüm gider ve mal kabul kalemlerini topla
                        BigDecimal totalRealCostForBatch = BigDecimal.ZERO;

                        // Partiye bağlı giderleri topla
                        for (Expense expense : allExpenses) {
                            if (expense.getProductionBatchId() != null && expense.getProductionBatchId().equals(batch.getId())) {
                                BigDecimal inflationFactor = inflationService.calculateInflationFactor(expense.getExpenseDate(), endDate, tenantId);
                                totalRealCostForBatch = totalRealCostForBatch.add(expense.getAmount().multiply(inflationFactor));
                            }
                        }
                        // Partiye bağlı mal kabul kalemlerini topla (isCommercial false olanlar)
                        for (GoodsReceipt gr : allGoodsReceipts) {
                            for (GoodsReceiptItem item : gr.getItems()) {
                                if (!item.isCommercial() && item.getProductionBatchId() != null && item.getProductionBatchId().equals(batch.getId())) {
                                    BigDecimal inflationFactor = inflationService.calculateInflationFactor(gr.getReceiptDate().toLocalDate(), endDate, tenantId);
                                    totalRealCostForBatch = totalRealCostForBatch.add(item.getPurchasePrice().multiply(new BigDecimal(item.getQuantity())).multiply(inflationFactor));
                                }
                            }
                        }

                        if (batchCurrentQuantity.compareTo(BigDecimal.ZERO) > 0) {
                            realCostPerUnit = totalRealCostForBatch.divide(batchCurrentQuantity, MathContext.DECIMAL128);
                        } else {
                            realCostPerUnit = BigDecimal.ZERO;
                        }

                    } else {
                        // Fidan Ticari Malsa (Al-Sat)
                        BigDecimal totalNominalPurchaseCostForPlant = BigDecimal.ZERO;
                        BigDecimal totalRealPurchaseCostForPlant = BigDecimal.ZERO;
                        long totalPurchasedQuantityForPlant = 0;

                        for (GoodsReceipt gr : allGoodsReceipts) {
                            for (GoodsReceiptItem item : gr.getItems()) {
                                if (item.getPlantId().equals(sale.getPlantId()) && item.isCommercial()) {
                                    totalNominalPurchaseCostForPlant = totalNominalPurchaseCostForPlant.add(item.getPurchasePrice().multiply(new BigDecimal(item.getQuantity())));

                                    LocalDate itemDate = gr.getReceiptDate().toLocalDate();
                                    BigDecimal inflationFactor = inflationService.calculateInflationFactor(itemDate, endDate, tenantId);
                                    totalRealPurchaseCostForPlant = totalRealPurchaseCostForPlant.add(item.getPurchasePrice().multiply(new BigDecimal(item.getQuantity())).multiply(inflationFactor));

                                    totalPurchasedQuantityForPlant += item.getQuantity();
                                }
                            }
                        }
                        if (totalPurchasedQuantityForPlant > 0) {
                            nominalCostPerUnit = totalNominalPurchaseCostForPlant.divide(new BigDecimal(totalPurchasedQuantityForPlant), MathContext.DECIMAL128);
                            realCostPerUnit = totalRealPurchaseCostForPlant.divide(new BigDecimal(totalPurchasedQuantityForPlant), MathContext.DECIMAL128);
                        } else {
                            nominalCostPerUnit = BigDecimal.ZERO;
                            realCostPerUnit = BigDecimal.ZERO;
                        }
                    }

                    // Toplam maliyetleri satılan miktar ile çarp
                    BigDecimal finalNominalCost = nominalCostPerUnit.multiply(new BigDecimal(sale.getTotalQuantitySold()));
                    BigDecimal finalRealCost = realCostPerUnit.multiply(new BigDecimal(sale.getTotalQuantitySold()));

                    // Karlılık hesaplamaları
                    BigDecimal nominalProfit = sale.getTotalRevenue().subtract(finalNominalCost);
                    BigDecimal realProfit = sale.getTotalRevenue().subtract(finalRealCost);
                    BigDecimal erodedValue = finalRealCost.subtract(finalNominalCost);


                    return ProfitabilityReportDto.builder()
                            .plantId(sale.getPlantId())
                            .plantName(plantName)
                            .totalQuantitySold(sale.getTotalQuantitySold())
                            .totalRevenue(sale.getTotalRevenue())
                            .nominalCost(finalNominalCost)
                            .realCost(finalRealCost)
                            .nominalProfit(nominalProfit)
                            .realProfit(realProfit)
                            .erodedValue(erodedValue)
                            .totalCost(finalNominalCost) // Mevcut totalCost alanı için nominal maliyeti kullanabiliriz
                            .totalProfit(nominalProfit) // Mevcut totalProfit alanı için nominal karı kullanabiliriz
                            .build();
                })
                .collect(Collectors.toList());
    }

    // Mevcut diğer metodlar (getDashboardOverview, getTopSellingPlants, getCustomerSales, getOverviewReport)
    // Bu metodların içerikleri daha önce paylaşıldığı gibidir, burada tekrar yazılmamıştır.
    // Lütfen kopyalarken bu açıklama kısmını dikkate alınız.
}