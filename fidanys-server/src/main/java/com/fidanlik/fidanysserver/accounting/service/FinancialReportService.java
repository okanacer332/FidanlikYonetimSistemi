package com.fidanlik.fidanysserver.accounting.service;

import com.fidanlik.fidanysserver.accounting.dto.RealProfitLossReportDTO;
import com.fidanlik.fidanysserver.accounting.model.Transaction;
import com.fidanlik.fidanysserver.accounting.repository.TransactionRepository;
import com.fidanlik.fidanysserver.common.inflation.InflationCalculationService;
import com.fidanlik.fidanysserver.expense.model.Expense;
import com.fidanlik.fidanysserver.expense.repository.ExpenseRepository;
import com.fidanlik.fidanysserver.invoicing.model.Invoice;
import com.fidanlik.fidanysserver.invoicing.repository.InvoiceRepository;
import com.fidanlik.fidanysserver.order.model.Order;
import com.fidanlik.fidanysserver.order.repository.OrderRepository;
import com.fidanlik.fidanysserver.fidan.model.ProductionBatch;
import com.fidanlik.fidanysserver.fidan.repository.ProductionBatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode; // <-- Bu satır EKLENDİ
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialReportService {

    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final OrderRepository orderRepository; // COGS için
    private final ProductionBatchRepository productionBatchRepository; // COGS için
    private final InflationCalculationService inflationCalculationService;

    // Gerçek Kar/Zarar Raporu Oluşturma
    public RealProfitLossReportDTO generateRealProfitLossReport(LocalDate startDate, LocalDate endDate, LocalDate baseDate, String tenantId) {
        BigDecimal nominalRevenue = BigDecimal.ZERO;
        BigDecimal realRevenue = BigDecimal.ZERO;
        BigDecimal nominalOperatingExpenses = BigDecimal.ZERO;
        BigDecimal realOperatingExpenses = BigDecimal.ZERO;
        BigDecimal nominalCostOfGoodsSold = BigDecimal.ZERO;
        BigDecimal realCostOfGoodsSold = BigDecimal.ZERO;

        // 1. Gelirleri Hesapla (Faturalardan)
        // Faturaların sadece belirli bir tarih aralığına düşenleri alınıyor.
        // Not: issueDate LocalDate olduğu için compareTo kullanıyoruz.
        List<Invoice> invoices = invoiceRepository.findAllByTenantId(tenantId).stream()
                .filter(invoice -> !invoice.getIssueDate().isBefore(startDate) && !invoice.getIssueDate().isAfter(endDate))
                .collect(Collectors.toList());

        for (Invoice invoice : invoices) {
            nominalRevenue = nominalRevenue.add(invoice.getTotalAmount());
            realRevenue = realRevenue.add(inflationCalculationService.calculateRealValue(invoice.getTotalAmount(), invoice.getIssueDate(), baseDate));
        }

        // 2. Giderleri Hesapla
        // Metot adı düzeltildi: findAllByTenantIdOrderByExpenseDateDesc
        List<Expense> expenses = expenseRepository.findAllByTenantIdOrderByExpenseDateDesc(tenantId).stream() // <-- Metot adı DÜZELTİLDİ
                .filter(expense -> !expense.getExpenseDate().isBefore(startDate) && !expense.getExpenseDate().isAfter(endDate))
                .collect(Collectors.toList());

        for (Expense expense : expenses) {
            nominalOperatingExpenses = nominalOperatingExpenses.add(expense.getAmount());
            realOperatingExpenses = realOperatingExpenses.add(inflationCalculationService.calculateRealValue(expense.getAmount(), expense.getExpenseDate(), baseDate));
        }

        // 3. Satılan Mal Maliyetini (COGS) Hesapla (Bu kısım daha karmaşık ve basitleştirilmiştir)
        // Gerçekçi bir COGS hesaplaması için, satılan her bir fidanın alış fiyatını veya üretim maliyetini
        // kendi tarihiyle birlikte takip etmek gerekir. Mevcut yapıda bu detay yok.
        // Şimdilik, basitleştirilmiş bir yaklaşımla, siparişin sevk edildiği andaki maliyeti
        // veya üretim partisi maliyetini kullanacağız.
        // NOT: Gerçek bir ERP'de COGS hesabı çok daha detaylı ve karmaşıktır (FIFO, LIFO, Weighted Average vs.)

        List<Order> shippedOrders = orderRepository.findAllByTenantId(tenantId).stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.SHIPPED || order.getStatus() == Order.OrderStatus.DELIVERED)
                .filter(order -> !order.getOrderDate().toLocalDate().isBefore(startDate) && !order.getOrderDate().toLocalDate().isAfter(endDate))
                .collect(Collectors.toList());

        for (Order order : shippedOrders) {
            for (Order.OrderItem item : order.getItems()) {
                // Her bir fidanın maliyetini bulmaya çalışalım.
                // Burada, eğer fidan bir üretim partisinden geliyorsa, o partinin maliyet havuzundan
                // birim maliyet hesaplayıp onu kullanmalıyız.
                // Basitleştirme: Eğer fidanın üretim partisi varsa, o partinin ortalama maliyetini al.
                // Yoksa, varsayılan bir maliyet (veya sıfır) kabul et.
                BigDecimal itemCost = BigDecimal.ZERO;
                if (item.getPlantId() != null) {
                    // İlgili fidanın üretim partisini bulup maliyetini çek.
                    // Bu kısım çok basitleştirilmiştir. Normalde her fidanın maliyeti izlenir.
                    // Şimdilik, productionBatchRepository'den ilgili plantId'ye göre batch bulup,
                    // o batch'in costPool'undan birim maliyet çıkarmaya çalışacağız.
                    // Bu kısım projenin mevcut veri yapısıyla tam entegre değil,
                    // varsayımsal bir mantık içeriyor.
                    List<ProductionBatch> relatedBatches = productionBatchRepository.findAllByTenantId(tenantId).stream()
                            .filter(pb -> pb.getPlantTypeId().equals(item.getPlantId())) // plantId yerine plantTypeId kullanıldı
                            .collect(Collectors.toList());

                    if (!relatedBatches.isEmpty()) {
                        ProductionBatch batch = relatedBatches.get(0); // İlk bulunan batch'i al
                        if (batch.getCurrentQuantity() > 0 && batch.getCostPool() != null) {
                            itemCost = batch.getCostPool().divide(new BigDecimal(batch.getCurrentQuantity()), 2, RoundingMode.HALF_UP);
                            // Maliyet havuzunun nominal tarihini bulmalıyız. Basitleştirme için batch startDate kullanılıyor.
                            nominalCostOfGoodsSold = nominalCostOfGoodsSold.add(itemCost.multiply(new BigDecimal(item.getQuantity())));
                            realCostOfGoodsSold = realCostOfGoodsSold.add(
                                    inflationCalculationService.calculateRealValue(
                                            itemCost.multiply(new BigDecimal(item.getQuantity())),
                                            batch.getStartDate(), // ProductionBatch'in başlangıç tarihi
                                            baseDate
                                    )
                            );
                        }
                    } else {
                        // Eğer bir üretim partisiyle ilişkili değilse, ve alış fiyatı bir yerden gelmiyorsa,
                        // bu maliyetin sıfır olduğu varsayılabilir veya ortalama bir alış fiyatı kullanılabilir.
                        // Şimdilik sıfır kabul edelim.
                    }
                }
            }
        }

        // Kar/Zarar Hesaplamaları
        BigDecimal nominalGrossProfit = nominalRevenue.subtract(nominalCostOfGoodsSold);
        BigDecimal realGrossProfit = realRevenue.subtract(realCostOfGoodsSold);

        BigDecimal nominalNetProfit = nominalGrossProfit.subtract(nominalOperatingExpenses);
        BigDecimal realNetProfit = realGrossProfit.subtract(realOperatingExpenses);

        return RealProfitLossReportDTO.builder()
                .period(YearMonth.from(startDate)) // Rapor başlangıç ayını kullan
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
}