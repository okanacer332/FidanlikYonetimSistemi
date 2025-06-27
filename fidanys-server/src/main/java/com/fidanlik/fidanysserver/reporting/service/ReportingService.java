package com.fidanlik.fidanysserver.reporting.service;

import com.fidanlik.fidanysserver.accounting.service.InflationAdjustmentService;
import com.fidanlik.fidanysserver.customer.model.Customer;
import com.fidanlik.fidanysserver.customer.repository.CustomerRepository;
import com.fidanlik.fidanysserver.expense.model.Expense;
import com.fidanlik.fidanysserver.expense.repository.ExpenseRepository;
import com.fidanlik.fidanysserver.fidan.model.Plant;
import com.fidanlik.fidanysserver.fidan.repository.PlantRepository;
import com.fidanlik.fidanysserver.goodsreceipt.model.GoodsReceipt;
import com.fidanlik.fidanysserver.order.model.Order;
import com.fidanlik.fidanysserver.order.repository.OrderRepository;
import com.fidanlik.fidanysserver.production.model.ProductionBatch;
import com.fidanlik.fidanysserver.production.repository.ProductionBatchRepository;
import com.fidanlik.fidanysserver.reporting.dto.*;
import com.fidanlik.fidanysserver.stock.model.Stock;
import com.fidanlik.fidanysserver.stock.repository.StockRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportingService {

    private final MongoTemplate mongoTemplate;
    private final PlantRepository plantRepository;
    private final CustomerRepository customerRepository;
    private final StockRepository stockRepository;
    private final OrderRepository orderRepository;

    private final ProductionBatchRepository productionBatchRepository;
    private final ExpenseRepository expenseRepository;
    private final InflationAdjustmentService inflationAdjustmentService;

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

        // *** HATANIN DÜZELTİLDİĞİ KISIM: Toplam Satış Hesaplaması ***
        // Burada quantity ve salePrice alanları, çarpılmadan önce Decimal'e çevriliyor.
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

        // 2. Net Kar
        List<ProfitabilityReportDto> profitabilityData = getProfitabilityReport(tenantId, startDate, endDate);
        BigDecimal netProfit = profitabilityData.stream().map(ProfitabilityReportDto::getTotalProfit).reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Toplam Sipariş
        long totalOrders = mongoTemplate.count(new org.springframework.data.mongodb.core.query.Query(new Criteria().andOperator(tenantCriteria, dateCriteria)), Order.class);

        // 4. Yeni Müşteri
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
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        Criteria dateCriteria = Criteria.where("orderDate").gte(startDateTime).lte(endDateTime);

        Aggregation salesAggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("tenantId").is(tenantId)
                        .and("status").is(Order.OrderStatus.DELIVERED)
                        .andOperator(dateCriteria)),
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

        Aggregation costAggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("tenantId").is(tenantId).and("status").is(GoodsReceipt.GoodsReceiptStatus.COMPLETED)),
                Aggregation.unwind("$items"),
                Aggregation.group("$items.plantId")
                        .avg(ConvertOperators.ToDecimal.toDecimal(ConditionalOperators.ifNull("$items.purchasePrice").then(new BigDecimal(0))))
                        .as("averageCost"),
                Aggregation.project("averageCost").and("_id").as("plantId")
        );
        AggregationResults<CostAggregationResult> costResults = mongoTemplate.aggregate(costAggregation, GoodsReceipt.class, CostAggregationResult.class);
        Map<String, BigDecimal> costMap = costResults.getMappedResults().stream()
                .collect(Collectors.toMap(
                        CostAggregationResult::getPlantId,
                        CostAggregationResult::getAverageCost
                ));

        return salesMap.values().stream()
                .map(sale -> {
                    BigDecimal averageCost = costMap.getOrDefault(sale.getPlantId(), BigDecimal.ZERO);
                    BigDecimal totalCost = averageCost.multiply(new BigDecimal(sale.getTotalQuantitySold()));
                    BigDecimal totalProfit = sale.getTotalRevenue().subtract(totalCost);
                    String plantName = plantRepository.findById(sale.getPlantId())
                            .map(plant -> plant.getPlantType().getName() + " - " + plant.getPlantVariety().getName())
                            .orElse("Bilinmeyen Fidan");
                    return ProfitabilityReportDto.builder()
                            .plantId(sale.getPlantId())
                            .plantName(plantName)
                            .totalQuantitySold(sale.getTotalQuantitySold())
                            .totalRevenue(sale.getTotalRevenue())
                            .totalCost(totalCost)
                            .totalProfit(totalProfit)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public List<RealProfitabilityReportDto> getRealProfitabilityReport(String tenantId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        // DÜZELTİLDİ: Repository'ye eklediğimiz yeni metot çağrılıyor.
        List<Order> deliveredOrders = orderRepository.findAllByTenantIdAndStatusAndOrderDateBetween(
                tenantId, Order.OrderStatus.DELIVERED, startDateTime, endDateTime
        );

        List<RealProfitabilityReportDto> report = new ArrayList<>();

        for (Order order : deliveredOrders) {
            for (Order.OrderItem item : order.getItems()) {

                // Satışın yapıldığı depodaki stok kaydını bul.
                Stock stock = stockRepository.findByPlantIdAndWarehouseIdAndTenantId(item.getPlantId(), order.getWarehouseId(), tenantId)
                        .orElse(null);

                if (stock == null || stock.getType() != Stock.StockType.IN_PRODUCTION || stock.getProductionBatchId() == null) {
                    continue;
                }

                ProductionBatch batch = productionBatchRepository.findById(stock.getProductionBatchId()).orElse(null);
                if (batch == null) continue;

                // DÜZELTİLDİ: Repository'ye eklediğimiz yeni metot çağrılıyor.
                List<Expense> batchExpenses = expenseRepository.findAllByProductionBatchIdAndTenantId(batch.getId(), tenantId);

                // Reel Maliyeti Hesapla
                BigDecimal totalRealCostForBatch = batchExpenses.stream()
                        .map(expense -> inflationAdjustmentService.adjustCostForInflation(
                                expense.getAmount(),
                                expense.getExpenseDate(), // DÜZELTİLDİ: .toLocalDate() kaldırıldı
                                order.getOrderDate().toLocalDate(),
                                tenantId
                        ))
                        .reduce(BigDecimal.ZERO, BigDecimal::add); // DÜZELTİLDİ: Tip uyumlu hale getirildi

                BigDecimal realUnitCost = BigDecimal.ZERO;
                // Satış anındaki miktar, zayiat sonrası güncel miktardır.
                if (batch.getCurrentQuantity() > 0) {
                    // DÜZELTİLDİ: RoundingMode importu sayesinde çalışacak
                    realUnitCost = totalRealCostForBatch.divide(new BigDecimal(batch.getCurrentQuantity()), 2, RoundingMode.HALF_UP);
                }

                String plantName = plantRepository.findById(item.getPlantId())
                        .map(p -> p.getPlantType().getName() + " " + p.getPlantVariety().getName())
                        .orElse("Bilinmeyen Fidan");

                BigDecimal totalRevenue = item.getSalePrice().multiply(new BigDecimal(item.getQuantity()));
                BigDecimal totalNominalCost = batch.getUnitCost().multiply(new BigDecimal(item.getQuantity()));
                BigDecimal totalRealCostValue = realUnitCost.multiply(new BigDecimal(item.getQuantity()));

                report.add(RealProfitabilityReportDto.builder()
                        .orderId(order.getId())
                        .orderNumber(order.getOrderNumber())
                        .saleDate(order.getOrderDate())
                        .plantId(item.getPlantId())
                        .plantName(plantName)
                        .quantitySold(item.getQuantity())
                        .salePrice(item.getSalePrice())
                        .totalRevenue(totalRevenue)
                        .nominalUnitCost(batch.getUnitCost())
                        .realUnitCost(realUnitCost)
                        .totalNominalCost(totalNominalCost)
                        .totalRealCost(totalRealCostValue)
                        .nominalProfit(totalRevenue.subtract(totalNominalCost))
                        .realProfit(totalRevenue.subtract(totalRealCostValue))
                        .inflationDifference(totalRealCostValue.subtract(totalNominalCost))
                        .build());
            }
        }
        return report;
    }
}