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
import com.fidanlik.fidanysserver.inflation.repository.InflationDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Slf4j import'u

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
@Slf4j // Loglama için Slf4j anotasyonu
public class FinancialReportService {

    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final OrderRepository orderRepository;
    private final ProductionBatchRepository productionBatchRepository;
    private final PlantRepository plantRepository;
    private final InflationCalculationService inflationCalculationService;
    private final InflationDataRepository inflationDataRepository;

    // Gerçek Kar/Zarar Raporu Oluşturma
    public RealProfitLossReportDTO generateRealProfitLossReport(LocalDate startDate, LocalDate endDate, LocalDate baseDate, String tenantId) {
        BigDecimal nominalRevenue = BigDecimal.ZERO;
        BigDecimal realRevenue = BigDecimal.ZERO;
        BigDecimal nominalOperatingExpenses = BigDecimal.ZERO;
        BigDecimal realOperatingExpenses = BigDecimal.ZERO;
        BigDecimal nominalCostOfGoodsSold = BigDecimal.ZERO;
        BigDecimal realCostOfGoodsSold = BigDecimal.ZERO;

        log.info("Rapor oluşturma başlatıldı. Başlangıç: {}, Bitiş: {}, Baz Tarih: {}, Tenant: {}", startDate, endDate, baseDate, tenantId);

        // Enflasyon hesaplamaları için kullanılacak efektif baz tarihini belirle
        LocalDate effectiveBaseDate = baseDate;

        // İstenen baseDate için doğrudan enflasyon verisi var mı kontrol et.
        // Eğer yoksa, en son mevcut enflasyon verisinin tarihini efektif baz tarihi olarak ayarla.
        // Veritabanındaki tarihler ayın son günü olduğu için, baseDate'i ayın son gününe yuvarla.
        LocalDate baseDateAsEndOfMonth = baseDate.withDayOfMonth(baseDate.lengthOfMonth());

        Optional<InflationData> baseDateExactData = inflationDataRepository.findByDate(baseDateAsEndOfMonth);

        if (baseDateExactData.isEmpty()) {
            log.warn("Belirtilen baz tarihi ({}) için doğrudan enflasyon verisi bulunamadı. En son mevcut tarih aranıyor...", baseDate);
            Optional<LocalDate> latestAvailableDateOptional = inflationCalculationService.getLatestAvailableInflationDate();

            if (latestAvailableDateOptional.isPresent()) {
                effectiveBaseDate = latestAvailableDateOptional.get();
                log.info("En son mevcut enflasyon verisi tarihi: {}. Bu tarih baz alınacaktır.", effectiveBaseDate);
            } else {
                log.error("Sistemde hiçbir enflasyon verisi bulunamadı. Reel kar/zarar nominal değerler ile aynı olacaktır.");
            }
        } else {
            log.info("Belirtilen baz tarihi ({}) için doğrudan enflasyon verisi mevcut. Efektif baz tarihi {} olarak ayarlandı.", baseDate, effectiveBaseDate);
        }

        // 1. Gelirleri Hesapla (Faturalardan)
        List<Invoice> invoices = invoiceRepository.findAllByTenantId(tenantId).stream()
                .filter(invoice -> {
                    boolean isInRange = !invoice.getIssueDate().isBefore(startDate) && !invoice.getIssueDate().isAfter(endDate);
                    log.info("Fatura kontrolü: ID={}, Tarih={}, Aralıkta mı? {}", invoice.getId(), invoice.getIssueDate(), isInRange);
                    return isInRange;
                })
                .collect(Collectors.toList());
        log.info("Toplam bulunan fatura sayısı: {}", invoices.size());

        for (Invoice invoice : invoices) {
            nominalRevenue = nominalRevenue.add(invoice.getTotalAmount());
            BigDecimal realValue = inflationCalculationService.calculateRealValue(invoice.getTotalAmount(), invoice.getIssueDate(), effectiveBaseDate);
            realRevenue = realRevenue.add(realValue);
            log.info("Fatura işlendi: ID={}, Tutar={}, Reel Tutar={}", invoice.getId(), invoice.getTotalAmount(), realValue);
        }
        log.info("Faturalar işlendikten sonra - Nominal Gelir: {}, Reel Gelir: {}", nominalRevenue, realRevenue);

        // 2. Giderleri Hesapla
        List<Expense> expenses = expenseRepository.findAllByTenantIdOrderByExpenseDateDesc(tenantId).stream()
                .filter(expense -> {
                    boolean isInRange = !expense.getExpenseDate().isBefore(startDate) && !expense.getExpenseDate().isAfter(endDate);
                    log.info("Gider kontrolü: ID={}, Tarih={}, Aralıkta mı? {}", expense.getId(), expense.getExpenseDate(), isInRange);
                    return isInRange;
                })
                .collect(Collectors.toList());
        log.info("Toplam bulunan gider sayısı: {}", expenses.size());

        for (Expense expense : expenses) {
            nominalOperatingExpenses = nominalOperatingExpenses.add(expense.getAmount());
            BigDecimal realValue = inflationCalculationService.calculateRealValue(expense.getAmount(), expense.getExpenseDate(), effectiveBaseDate);
            realOperatingExpenses = realOperatingExpenses.add(realValue);
            log.info("Gider işlendi: ID={}, Tutar={}, Reel Tutar={}", expense.getId(), expense.getAmount(), realValue);
        }
        log.info("Giderler işlendikten sonra - Nominal Gider: {}, Reel Gider: {}", nominalOperatingExpenses, realOperatingExpenses);

        // 3. Satılan Mal Maliyetini (COGS) Hesapla
        List<Order> shippedOrders = orderRepository.findAllByTenantId(tenantId).stream()
                .filter(order -> {
                    boolean isShippedOrDelivered = order.getStatus() == Order.OrderStatus.SHIPPED || order.getStatus() == Order.OrderStatus.DELIVERED;
                    boolean isInRange = !order.getOrderDate().toLocalDate().isBefore(startDate) && !order.getOrderDate().toLocalDate().isAfter(endDate);
                    log.info("Sipariş kontrolü: ID={}, Durum={}, Tarih={}, Aralıkta mı? {}, Durum uygun mu? {}", order.getId(), order.getStatus(), order.getOrderDate().toLocalDate(), isInRange, isShippedOrDelivered);
                    return isShippedOrDelivered && isInRange;
                })
                .collect(Collectors.toList());
        log.info("Toplam bulunan sevk edilmiş sipariş sayısı: {}", shippedOrders.size());

        for (Order order : shippedOrders) {
            log.info("Sipariş işleniyor: ID={}, Sipariş Numarası={}, Kalem Sayısı={}", order.getId(), order.getOrderNumber(), order.getItems().size());
            for (Order.OrderItem item : order.getItems()) {
                log.info("Sipariş kalemi işleniyor: PlantId={}, Miktar={}", item.getPlantId(), item.getQuantity());
                BigDecimal itemCost = BigDecimal.ZERO;
                LocalDate costDate = order.getOrderDate().toLocalDate(); // Maliyet tarihi varsayılan olarak sipariş tarihi

                if (item.getPlantId() != null) {
                    Optional<Plant> optionalPlant = plantRepository.findById(item.getPlantId());
                    if (optionalPlant.isPresent()) {
                        Plant plant = optionalPlant.get();
                        log.info("Plant bulundu: ID={}, PlantType={}, PlantVariety={}", plant.getId(), plant.getPlantType().getId(), plant.getPlantVariety().getId());

                        // Tüm ProductionBatch'leri çek ve logla
                        List<ProductionBatch> allTenantProductionBatches = productionBatchRepository.findAllByTenantId(tenantId);
                        log.info("findAllByTenantId tarafından çekilen ProductionBatch sayısı: {}", allTenantProductionBatches.size());
                        allTenantProductionBatches.forEach(pb -> log.info("Çekilen ProductionBatch: ID={}, PlantType={}, PlantVariety={}, StartDate={}, CostPool={}, CurrentQuantity={}",
                                pb.getId(), pb.getPlantTypeId(), pb.getPlantVarietyId(), pb.getStartDate(), pb.getCostPool(), pb.getCurrentQuantity()));


                        List<ProductionBatch> matchingBatches = allTenantProductionBatches.stream() // Burayı allTenantProductionBatches.stream() olarak değiştirdik
                                .filter(pb -> {
                                    boolean typeMatch = pb.getPlantTypeId().equals(plant.getPlantTypeId());
                                    boolean varietyMatch = pb.getPlantVarietyId().equals(plant.getPlantVarietyId());
                                    // ProductionBatch'in başlangıç tarihi, sipariş tarihinden sonra olmamalı
                                    boolean dateMatch = !pb.getStartDate().isAfter(order.getOrderDate().toLocalDate());
                                    log.info("ProductionBatch filtresi: PB_ID={}, PB_StartDate={}, Order_Date={}, TypeMatch={}, VarietyMatch={}, DateMatch={}",
                                            pb.getId(), pb.getStartDate(), order.getOrderDate().toLocalDate(), typeMatch, varietyMatch, dateMatch);
                                    return typeMatch && varietyMatch && dateMatch;
                                })
                                .sorted(Comparator.comparing(ProductionBatch::getStartDate).reversed()) // En yeni partiden başla
                                .collect(Collectors.toList());

                        if (!matchingBatches.isEmpty()) {
                            ProductionBatch batch = matchingBatches.get(0); // En son eşleşen partiyi al
                            log.info("Eşleşen ProductionBatch bulundu: ID={}, CurrentQuantity={}, CostPool={}", batch.getId(), batch.getCurrentQuantity(), batch.getCostPool());
                            if (batch.getCurrentQuantity() > 0 && batch.getCostPool() != null) {
                                itemCost = batch.getCostPool().divide(new BigDecimal(batch.getCurrentQuantity()), 2, RoundingMode.HALF_UP);
                                costDate = batch.getStartDate(); // Maliyetin gerçek tarihi: Üretim partisinin başlangıç tarihi
                                log.info("Maliyet hesaplandı: ItemCost={}, CostDate={}", itemCost, costDate);
                            } else {
                                log.warn("ProductionBatch'in miktarı 0 veya CostPool null. Maliyet 0 olarak kabul edildi. PB_ID={}", batch.getId());
                            }
                        } else {
                            log.warn("Plant için eşleşen ProductionBatch bulunamadı. PlantType={}, PlantVariety={}. Maliyet 0 olarak kabul edildi.", plant.getPlantType().getId(), plant.getPlantVariety().getId());
                        }
                    } else {
                        log.warn("Sipariş kalemindeki Plant ID'si bulunamadı: {}. Maliyet 0 olarak kabul edildi.", item.getPlantId());
                    }
                }
                nominalCostOfGoodsSold = nominalCostOfGoodsSold.add(itemCost.multiply(new BigDecimal(item.getQuantity())));
                BigDecimal realItemCost = inflationCalculationService.calculateRealValue(
                        itemCost.multiply(new BigDecimal(item.getQuantity())),
                        costDate, // Maliyetin gerçekleştiği tarih
                        effectiveBaseDate // Raporun baz tarihi
                );
                realCostOfGoodsSold = realCostOfGoodsSold.add(realItemCost);
                log.info("COGS işlendi: Nominal Item Cost={}, Reel Item Cost={}", itemCost.multiply(new BigDecimal(item.getQuantity())), realItemCost);
            }
        }
        log.info("COGS işlendikten sonra - Nominal COGS: {}, Reel COGS: {}", nominalCostOfGoodsSold, realCostOfGoodsSold);

        BigDecimal nominalGrossProfit = nominalRevenue.subtract(nominalCostOfGoodsSold);
        BigDecimal realGrossProfit = realRevenue.subtract(realCostOfGoodsSold);

        BigDecimal nominalNetProfit = nominalGrossProfit.subtract(nominalOperatingExpenses);
        BigDecimal realNetProfit = realGrossProfit.subtract(realOperatingExpenses);

        log.info("Raporlama tamamlandı. Nominal Net Kar: {}, Reel Net Kar: {}", nominalNetProfit, realNetProfit);

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
