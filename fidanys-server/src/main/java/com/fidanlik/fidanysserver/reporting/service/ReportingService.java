package com.fidanlik.fidanysserver.reporting.service;

import com.fidanlik.fidanysserver.customer.repository.CustomerRepository;
import com.fidanlik.fidanysserver.fidan.model.Plant;
import com.fidanlik.fidanysserver.fidan.repository.PlantRepository;
import com.fidanlik.fidanysserver.goodsreceipt.model.GoodsReceipt;
import com.fidanlik.fidanysserver.order.model.Order;
import com.fidanlik.fidanysserver.order.repository.OrderRepository;
import com.fidanlik.fidanysserver.reporting.dto.CustomerSalesReport;
import com.fidanlik.fidanysserver.reporting.dto.OverviewReportDto;
import com.fidanlik.fidanysserver.reporting.dto.ProfitabilityReportDto;
import com.fidanlik.fidanysserver.reporting.dto.TopSellingPlantReport;
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
import java.time.ZoneId;
import java.util.Collections;
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

    // Bu metotlarda değişiklik yok
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
    public List<TopSellingPlantReport> getTopSellingPlants(String tenantId) {
        // Bu metot da ileride tarih filtresi alabilir ama şimdilik aynı bırakıyoruz.
        Aggregation plantAggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("tenantId").is(tenantId).and("status").is(Order.OrderStatus.DELIVERED)),
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
    public List<CustomerSalesReport> getCustomerSales(String tenantId) {
        // Bu metot da ileride tarih filtresi alabilir ama şimdilik aynı bırakıyoruz.
        Aggregation customerAggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("tenantId").is(tenantId).and("status").is(Order.OrderStatus.DELIVERED)),
                Aggregation.unwind("items"),
                Aggregation.group("customerId").sum(ArithmeticOperators.Multiply.valueOf(ConvertOperators.ToDecimal.toDecimal(ConditionalOperators.ifNull("items.quantity").then(0))).multiplyBy(ConvertOperators.ToDecimal.toDecimal(ConditionalOperators.ifNull("items.salePrice").then(new BigDecimal(0))))).as("totalSalesAmount").addToSet("_id").as("orderIds"),
                Aggregation.project("totalSalesAmount").and("_id").as("customerId").and("orderIds").size().as("orderCount"),
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

    // --- BU METOT GÜNCELLENDİ ---
    public List<ProfitabilityReportDto> getProfitabilityReport(String tenantId, LocalDate startDate, LocalDate endDate) {
        // Tarih filtresini MongoDB'nin anlayacağı formata çeviriyoruz.
        // Başlangıç tarihinin başlangıcından, bitiş tarihinin sonuna kadar olan aralığı alıyoruz.
        Criteria dateCriteria = Criteria.where("orderDate")
                .gte(startDate.atStartOfDay(ZoneId.systemDefault()).toInstant())
                .lte(endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant());

        // Adım 1: Satışları hesaplarken tarih kriterini ekliyoruz.
        Aggregation salesAggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("tenantId").is(tenantId)
                        .and("status").is(Order.OrderStatus.DELIVERED)
                        .andOperator(dateCriteria)), // TARİH FİLTRESİ BURAYA EKLENDİ
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

        // Adım 2: Maliyetleri hesaplarken tarih filtresine gerek yok, ortalama maliyet tüm zamanlar için aynıdır.
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

        // Adım 3: İki veriyi birleştir ve karlılığı hesapla
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
}