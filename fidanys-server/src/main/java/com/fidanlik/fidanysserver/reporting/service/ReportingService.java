package com.fidanlik.fidanysserver.reporting.service;

import com.fidanlik.fidanysserver.customer.repository.CustomerRepository;
import com.fidanlik.fidanysserver.fidan.repository.PlantRepository;
import com.fidanlik.fidanysserver.order.model.Order;
import com.fidanlik.fidanysserver.reporting.dto.CustomerSalesReport;
import com.fidanlik.fidanysserver.reporting.dto.TopSellingPlantReport;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.ArithmeticOperators;
import org.springframework.data.mongodb.core.aggregation.ConditionalOperators;
import org.springframework.data.mongodb.core.aggregation.ConvertOperators; // YENİ IMPORT
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportingService {

    private final MongoTemplate mongoTemplate;
    private final PlantRepository plantRepository;
    private final CustomerRepository customerRepository;

    // Geçici DTO'lar
    @Data private static class PlantSaleResult { String plantId; int totalQuantitySold; }
    @Data private static class CustomerSaleResult { String customerId; BigDecimal totalSalesAmount; int orderCount; }

    public List<TopSellingPlantReport> getTopSellingPlants(String tenantId) {
        Aggregation plantAggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("tenantId").is(tenantId).and("status").is(Order.OrderStatus.DELIVERED)),
                Aggregation.unwind("items"),
                Aggregation.group("items.plantId")
                        .sum("items.quantity").as("totalQuantitySold"),
                Aggregation.sort(Sort.Direction.DESC, "totalQuantitySold"),
                Aggregation.limit(10),
                Aggregation.project("totalQuantitySold").and("_id").as("plantId")
        );

        AggregationResults<PlantSaleResult> plantResults = mongoTemplate.aggregate(plantAggregation, Order.class, PlantSaleResult.class);

        if (plantResults.getMappedResults().isEmpty()) {
            return Collections.emptyList();
        }

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
        Aggregation customerAggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("tenantId").is(tenantId).and("status").is(Order.OrderStatus.DELIVERED)),
                Aggregation.unwind("items"),
                Aggregation.group("customerId")
                        .sum(
                                // DÜZELTME: Çarpma işleminden önce alanları sayısal tipe dönüştür
                                ArithmeticOperators.Multiply.valueOf(
                                        ConvertOperators.ToDecimal.toDecimal(
                                                ConditionalOperators.ifNull("items.quantity").then(0)
                                        )
                                ).multiplyBy(
                                        ConvertOperators.ToDecimal.toDecimal(
                                                ConditionalOperators.ifNull("items.salePrice").then(new BigDecimal(0))
                                        )
                                )
                        ).as("totalSalesAmount")
                        .addToSet("_id").as("orderIds"),
                Aggregation.project("totalSalesAmount")
                        .and("_id").as("customerId")
                        .and("orderIds").size().as("orderCount"),
                Aggregation.sort(Sort.Direction.DESC, "totalSalesAmount")
        );

        AggregationResults<CustomerSaleResult> customerResults = mongoTemplate.aggregate(customerAggregation, Order.class, CustomerSaleResult.class);

        if (customerResults.getMappedResults().isEmpty()) {
            return Collections.emptyList();
        }

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
}
