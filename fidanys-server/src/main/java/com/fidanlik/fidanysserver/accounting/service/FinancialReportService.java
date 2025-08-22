package com.fidanlik.fidanysserver.accounting.service;

import com.fidanlik.fidanysserver.accounting.dto.RealProfitLossReportDTO;
import com.fidanlik.fidanysserver.common.inflation.InflationCalculationService;
import com.fidanlik.fidanysserver.expense.model.Expense;
import com.fidanlik.fidanysserver.expense.repository.ExpenseRepository;
import com.fidanlik.fidanysserver.fidan.model.Plant;
import com.fidanlik.fidanysserver.fidan.model.ProductionBatch;
import com.fidanlik.fidanysserver.fidan.repository.PlantRepository;
import com.fidanlik.fidanysserver.fidan.repository.ProductionBatchRepository;
import com.fidanlik.fidanysserver.inflation.model.InflationData;
import com.fidanlik.fidanysserver.inflation.repository.InflationDataRepository;
import com.fidanlik.fidanysserver.invoicing.model.Invoice;
import com.fidanlik.fidanysserver.invoicing.repository.InvoiceRepository;
import com.fidanlik.fidanysserver.order.model.Order;
import com.fidanlik.fidanysserver.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinancialReportService {

    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final OrderRepository orderRepository;
    private final ProductionBatchRepository productionBatchRepository;
    private final PlantRepository plantRepository;
    private final InflationCalculationService inflationCalculationService;
    private final InflationDataRepository inflationDataRepository;

    public RealProfitLossReportDTO generateRealProfitLossReport(LocalDate startDate, LocalDate endDate, LocalDate baseDate, String tenantId) {
        log.info("Reel Kâr/Zarar Raporu oluşturuluyor. Aral?k: {}-{}, Baz Tarih: {}, Tenant: {}", startDate, endDate, baseDate, tenantId);

        // 1. Gelirleri Hesapla (Faturalardan)
        List<Invoice> invoices = invoiceRepository.findAllByTenantIdAndIssueDateBetween(tenantId, startDate, endDate);
        BigDecimal nominalRevenue = invoices.stream().map(Invoice::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal realRevenue = invoices.stream()
                .map(inv -> inflationCalculationService.calculateRealValue(inv.getTotalAmount(), inv.getIssueDate(), baseDate))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        log.info("Hesaplanan Gelirler -> Nominal: {}, Reel: {}", nominalRevenue, realRevenue);

        // 2. İşletme Giderlerini Hesapla
        List<Expense> expenses = expenseRepository.findAllByTenantIdAndExpenseDateBetweenOrderByExpenseDateAsc(tenantId, startDate, endDate);
        BigDecimal nominalOperatingExpenses = expenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal realOperatingExpenses = expenses.stream()
                .map(exp -> inflationCalculationService.calculateRealValue(exp.getAmount(), exp.getExpenseDate(), baseDate))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        log.info("Hesaplanan Giderler -> Nominal: {}, Reel: {}", nominalOperatingExpenses, realOperatingExpenses);

        // 3. Satılan Malın Maliyetini (SMM) Hesapla
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        List<Order> shippedOrders = orderRepository.findAllByTenantIdAndStatusInAndOrderDateBetween(
                tenantId, List.of(Order.OrderStatus.SHIPPED, Order.OrderStatus.DELIVERED), startDateTime, endDateTime);

        BigDecimal nominalCostOfGoodsSold = BigDecimal.ZERO;
        BigDecimal realCostOfGoodsSold = BigDecimal.ZERO;

        for (Order order : shippedOrders) {
            for (Order.OrderItem item : order.getItems()) {
                // Her bir sipariş kalemi için üretim maliyetini bul ve topla
                CostInfo costInfo = findCostForOrderItem(item, order.getOrderDate().toLocalDate(), tenantId);
                nominalCostOfGoodsSold = nominalCostOfGoodsSold.add(costInfo.getNominalCost());

                BigDecimal realItemCost = inflationCalculationService.calculateRealValue(costInfo.getNominalCost(), costInfo.getCostDate(), baseDate);
                realCostOfGoodsSold = realCostOfGoodsSold.add(realItemCost);
            }
        }
        log.info("Hesaplanan SMM -> Nominal: {}, Reel: {}", nominalCostOfGoodsSold, realCostOfGoodsSold);

        // 4. Kâr/Zarar Hesaplamaları
        BigDecimal nominalGrossProfit = nominalRevenue.subtract(nominalCostOfGoodsSold);
        BigDecimal realGrossProfit = realRevenue.subtract(realCostOfGoodsSold);
        BigDecimal nominalNetProfit = nominalGrossProfit.subtract(nominalOperatingExpenses);
        BigDecimal realNetProfit = realGrossProfit.subtract(realOperatingExpenses);
        log.info("Hesaplanan Net Kâr -> Nominal: {}, Reel: {}", nominalNetProfit, realNetProfit);

        return RealProfitLossReportDTO.builder()
                .period(YearMonth.from(startDate))
                .nominalRevenue(nominalRevenue)
                .realRevenue(realRevenue)
                .nominalCostOfGoodsSold(nominalCostOfGoodsSold)
                .realCostOfGoodsSold(realCostOfGoodsSold)
                .nominalOperatingExpenses(nominalOperatingExpenses)
                .realOperatingExpenses(realOperatingExpenses)
                .nominalGrossProfit(nominalGrossProfit)
                .realGrossProfit(realGrossProfit)
                .nominalNetProfit(nominalNetProfit)
                .realNetProfit(realNetProfit)
                .baseInflationDate(baseDate)
                .build();
    }

    // Satılan bir ürünün maliyetini ve maliyet tarihini bulan yardımcı metot
    private CostInfo findCostForOrderItem(Order.OrderItem item, LocalDate orderDate, String tenantId) {
        Plant plant = plantRepository.findById(item.getPlantId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Siparişteki fidan bulunamadı: " + item.getPlantId()));

        // Fidanla eşleşen ve sipariş tarihinden önce başlamış en son üretim partisini bul
        Optional<ProductionBatch> latestBatchOpt = productionBatchRepository.findAllByTenantId(tenantId).stream()
                .filter(pb -> pb.getPlantTypeId().equals(plant.getPlantTypeId()) &&
                        pb.getPlantVarietyId().equals(plant.getPlantVarietyId()) &&
                        !pb.getStartDate().isAfter(orderDate))
                .max(Comparator.comparing(ProductionBatch::getStartDate));

        if (latestBatchOpt.isPresent()) {
            ProductionBatch batch = latestBatchOpt.get();
            if (batch.getCurrentQuantity() > 0 && batch.getCostPool() != null) {
                BigDecimal unitCost = batch.getCostPool().divide(new BigDecimal(batch.getCurrentQuantity()), 2, RoundingMode.HALF_UP);
                BigDecimal totalItemCost = unitCost.multiply(new BigDecimal(item.getQuantity()));
                return new CostInfo(totalItemCost, batch.getStartDate());
            }
        }

        log.warn("Fidan ID {} için üretim maliyeti bulunamadı, maliyet 0 kabul ediliyor.", item.getPlantId());
        return new CostInfo(BigDecimal.ZERO, orderDate); // Maliyet bulunamazsa sıfır ve sipariş tarihi
    }

    // Maliyet bilgilerini taşımak için küçük bir yardımcı sınıf
    private static class CostInfo {
        private final BigDecimal nominalCost;
        private final LocalDate costDate;

        public CostInfo(BigDecimal nominalCost, LocalDate costDate) {
            this.nominalCost = nominalCost;
            this.costDate = costDate;
        }
        public BigDecimal getNominalCost() { return nominalCost; }
        public LocalDate getCostDate() { return costDate; }
    }
}