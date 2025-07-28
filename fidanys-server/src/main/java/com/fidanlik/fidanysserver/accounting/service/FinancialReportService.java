package com.fidanlik.fidanysserver.accounting.service;

import com.fidanlik.fidanysserver.accounting.dto.RealProfitLossReportDTO;
import com.fidanlik.fidanysserver.accounting.model.Transaction;
import com.fidanlik.fidanysserver.accounting.repository.TransactionRepository;
import com.fidanlik.fidanysserver.common.inflation.InflationCalculationService;
import com.fidanlik.fidanysserver.expense.model.Expense;
import com.fidanlik.fidanysserver.expense.repository.ExpenseRepository;
import com.fidanlik.fidanysserver.inflation.model.InflationData;
import com.fidanlik.fidanysserver.invoicing.model.Invoice;
import com.fidanlik.fidanysserver.invoicing.repository.InvoiceRepository;
import com.fidanlik.fidanysserver.order.model.Order;
import com.fidanlik.fidanysserver.order.repository.OrderRepository;
import com.fidanlik.fidanysserver.fidan.model.Plant;
import com.fidanlik.fidanysserver.fidan.model.ProductionBatch;
import com.fidanlik.fidanysserver.fidan.repository.ProductionBatchRepository;
import com.fidanlik.fidanysserver.fidan.repository.PlantRepository;
import com.fidanlik.fidanysserver.inflation.repository.InflationDataRepository; // Yeni: InflationDataRepository eklendi (eğer daha önce yoksa)
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private final InflationDataRepository inflationDataRepository; // Yeni: InflationDataRepository enjekte edildi

    // Gerçek Kar/Zarar Raporu Oluşturma
    public RealProfitLossReportDTO generateRealProfitLossReport(LocalDate startDate, LocalDate endDate, LocalDate baseDate, String tenantId) {
        BigDecimal nominalRevenue = BigDecimal.ZERO;
        BigDecimal realRevenue = BigDecimal.ZERO;
        BigDecimal nominalOperatingExpenses = BigDecimal.ZERO;
        BigDecimal realOperatingExpenses = BigDecimal.ZERO;
        BigDecimal nominalCostOfGoodsSold = BigDecimal.ZERO;
        BigDecimal realCostOfGoodsSold = BigDecimal.ZERO;

        // Enflasyon hesaplamaları için kullanılacak efektif baz tarihini belirle
        LocalDate effectiveBaseDate = baseDate; // Varsayılan olarak frontend'den gelen baseDate

        // İstenen baseDate için doğrudan enflasyon verisi var mı kontrol et.
        // Eğer yoksa, en son mevcut enflasyon verisinin tarihini efektif baz tarihi olarak ayarla.
        // Veritabanındaki tarihler ayın son günü olduğu için, baseDate'i ayın son gününe yuvarla.
        LocalDate baseDateAsEndOfMonth = baseDate.withDayOfMonth(baseDate.lengthOfMonth());

        Optional<InflationData> baseDateExactData = inflationDataRepository.findByDate(baseDateAsEndOfMonth);

        if (baseDateExactData.isEmpty()) {
            log.warn("Belirtilen baz tarihi ({}) için doğrudan enflasyon verisi bulunamadı. En son mevcut tarih aranıyor...", baseDate);
            Optional<LocalDate> latestAvailableDateOptional = inflationCalculationService.getLatestAvailableInflationDate();

            if (latestAvailableDateOptional.isPresent()) {
                effectiveBaseDate = latestAvailableDateOptional.get(); // En son mevcut enflasyon verisinin tarihi
                log.info("En son mevcut enflasyon verisi tarihi: {}. Bu tarih baz alınacaktır.", effectiveBaseDate);
            } else {
                log.error("Sistemde hiçbir enflasyon verisi bulunamadı. Reel kar/zarar nominal değerler ile aynı olacaktır.");
                // effectiveBaseDate bu durumda orijinal baseDate olarak kalır, ancak reel hesaplama anlamlı olmaz.
            }
        } else {
            log.info("Belirtilen baz tarihi ({}) için doğrudan enflasyon verisi mevcut. Efektif baz tarihi {} olarak ayarlandı.", baseDate, effectiveBaseDate);
            // effectiveBaseDate zaten orijinal baseDate (2025-07-31) olarak kalacak
            // bu durumda effectiveBaseDate, frontend'den gelen baseDate (örn: 2025-07-31) olacaktır
        }

        // Önemli Not: effectiveBaseDate artık ayın ilk günü değil, veritabanından geldiği gibi ayın son günü olabilir.
        // Ancak InflationCalculationService metodları LocalDate.withDayOfMonth(1) veya .lengthOfMonth() kullanarak kendi içlerinde normalize ediyor.
        // Bu yüzden burada ek bir ayarlama yapmaya gerek yok, sadece parametre olarak effectiveBaseDate'i gönderiyoruz.


        // 1. Gelirleri Hesapla (Faturalardan)
        List<Invoice> invoices = invoiceRepository.findAllByTenantId(tenantId).stream()
                .filter(invoice -> !invoice.getIssueDate().isBefore(startDate) && !invoice.getIssueDate().isAfter(endDate))
                .collect(Collectors.toList());

        for (Invoice invoice : invoices) {
            nominalRevenue = nominalRevenue.add(invoice.getTotalAmount());
            realRevenue = realRevenue.add(inflationCalculationService.calculateRealValue(invoice.getTotalAmount(), invoice.getIssueDate(), effectiveBaseDate));
        }

        // 2. Giderleri Hesapla
        List<Expense> expenses = expenseRepository.findAllByTenantIdOrderByExpenseDateDesc(tenantId).stream()
                .filter(expense -> !expense.getExpenseDate().isBefore(startDate) && !expense.getExpenseDate().isAfter(endDate))
                .collect(Collectors.toList());

        for (Expense expense : expenses) {
            nominalOperatingExpenses = nominalOperatingExpenses.add(expense.getAmount());
            realOperatingExpenses = realOperatingExpenses.add(inflationCalculationService.calculateRealValue(expense.getAmount(), expense.getExpenseDate(), effectiveBaseDate));
        }

        // 3. Satılan Mal Maliyetini (COGS) Hesapla
        List<Order> shippedOrders = orderRepository.findAllByTenantId(tenantId).stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.SHIPPED || order.getStatus() == Order.OrderStatus.DELIVERED)
                .filter(order -> !order.getOrderDate().toLocalDate().isBefore(startDate) && !order.getOrderDate().toLocalDate().isAfter(endDate))
                .collect(Collectors.toList());

        for (Order order : shippedOrders) {
            for (Order.OrderItem item : order.getItems()) {
                BigDecimal itemCost = BigDecimal.ZERO;
                LocalDate costDate = order.getOrderDate().toLocalDate();

                if (item.getPlantId() != null) {
                    Optional<Plant> optionalPlant = plantRepository.findById(item.getPlantId());
                    if (optionalPlant.isPresent()) {
                        Plant plant = optionalPlant.get();

                        List<ProductionBatch> matchingBatches = productionBatchRepository.findAllByTenantId(tenantId).stream()
                                .filter(pb -> pb.getPlantTypeId().equals(plant.getPlantTypeId()) &&
                                        pb.getPlantVarietyId().equals(plant.getPlantVarietyId()))
                                .filter(pb -> !pb.getStartDate().isAfter(order.getOrderDate().toLocalDate()))
                                .sorted(Comparator.comparing(ProductionBatch::getStartDate).reversed())
                                .collect(Collectors.toList());

                        if (!matchingBatches.isEmpty()) {
                            ProductionBatch batch = matchingBatches.get(0);
                            if (batch.getCurrentQuantity() > 0 && batch.getCostPool() != null) {
                                itemCost = batch.getCostPool().divide(new BigDecimal(batch.getCurrentQuantity()), 2, RoundingMode.HALF_UP);
                                costDate = batch.getStartDate();
                            }
                        }
                    }
                }
                nominalCostOfGoodsSold = nominalCostOfGoodsSold.add(itemCost.multiply(new BigDecimal(item.getQuantity())));
                realCostOfGoodsSold = realCostOfGoodsSold.add(
                        inflationCalculationService.calculateRealValue(
                                itemCost.multiply(new BigDecimal(item.getQuantity())),
                                costDate,
                                effectiveBaseDate
                        )
                );
            }
        }

        BigDecimal nominalGrossProfit = nominalRevenue.subtract(nominalCostOfGoodsSold);
        BigDecimal realGrossProfit = realRevenue.subtract(realCostOfGoodsSold);

        BigDecimal nominalNetProfit = nominalGrossProfit.subtract(nominalOperatingExpenses);
        BigDecimal realNetProfit = realGrossProfit.subtract(realOperatingExpenses);

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
                .baseInflationDate(effectiveBaseDate)
                .build();
    }
}