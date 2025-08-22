package com.fidanlik.fidanysserver.dashboard.service;

import com.fidanlik.fidanysserver.common.inflation.InflationCalculationService;
import com.fidanlik.fidanysserver.dashboard.dto.CostAnalysisReportDTO;
import com.fidanlik.fidanysserver.dashboard.dto.InflationOverviewDTO;
import com.fidanlik.fidanysserver.dashboard.dto.PricePerformanceReportDTO;
import com.fidanlik.fidanysserver.expense.model.Expense;
import com.fidanlik.fidanysserver.expense.repository.ExpenseRepository;
import com.fidanlik.fidanysserver.inflation.model.InflationData;
import com.fidanlik.fidanysserver.inflation.repository.InflationDataRepository;
import com.fidanlik.fidanysserver.order.model.Order;
import com.fidanlik.fidanysserver.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.IsoFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final InflationDataRepository inflationDataRepository;
    private final ExpenseRepository expenseRepository;
    private final OrderRepository orderRepository;
    private final InflationCalculationService inflationCalculationService;

    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final BigDecimal TEN_THOUSAND = new BigDecimal("10000");

    // --- Rapor 1: Enflasyon Genel Bakış ---
    public InflationOverviewDTO getInflationOverview(String tenantId) {
        log.info("Enflasyon Genel Bakış Raporu oluşturuluyor...");

        Pageable last12MonthsPageable = PageRequest.of(0, 12, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "date"));
        List<InflationData> last12MonthsData = inflationDataRepository.findAllByOrderByDateDesc(last12MonthsPageable);

        BigDecimal annualProducerPriceIndex = BigDecimal.ZERO;
        BigDecimal purchasingPowerOf10k = TEN_THOUSAND;

        if (last12MonthsData != null && last12MonthsData.size() == 12) {
            log.info("Yıllık enflasyon hesaplaması için {} adet veri bulundu.", last12MonthsData.size());

            BigDecimal cumulativeFactor = last12MonthsData.stream()
                    .filter(Objects::nonNull)
                    .map(InflationData::getValue)
                    .filter(Objects::nonNull)
                    .map(rate -> BigDecimal.ONE.add(rate.divide(HUNDRED, 8, RoundingMode.HALF_UP)))
                    .reduce(BigDecimal.ONE, BigDecimal::multiply);

            annualProducerPriceIndex = (cumulativeFactor.subtract(BigDecimal.ONE)).multiply(HUNDRED);
            purchasingPowerOf10k = TEN_THOUSAND.divide(cumulativeFactor, 2, RoundingMode.HALF_UP);
            log.info("12 aylık veriyle tam hesaplama yapıldı. Yıllık ÜFE: {}, Alım Gücü: {}", annualProducerPriceIndex, purchasingPowerOf10k);
        } else {
            log.warn("Yıllık enflasyon hesaplaması için 12 aydan az ({} adet) veri bulundu. Rapor eksik olabilir.", last12MonthsData != null ? last12MonthsData.size() : 0);
        }

        Pageable last24MonthsPageable = PageRequest.of(0, 24, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "date"));
        List<InflationData> last24MonthsData = inflationDataRepository.findAllByOrderByDateDesc(last24MonthsPageable);

        List<InflationOverviewDTO.MonthlyInflationRateDTO> monthlyTrend = Collections.emptyList();

        if (last24MonthsData != null && !last24MonthsData.isEmpty()) {
            log.info("Aylık trend için {} adet veri bulundu.", last24MonthsData.size());
            Collections.reverse(last24MonthsData);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy", new Locale("tr"));

            monthlyTrend = last24MonthsData.stream()
                    .filter(data -> data != null && data.getDate() != null && data.getValue() != null)
                    .map(data -> InflationOverviewDTO.MonthlyInflationRateDTO.builder()
                            .monthYear(data.getDate().format(formatter))
                            .rate(data.getValue())
                            .build())
                    .collect(Collectors.toList());
        } else {
            log.warn("Aylık trend için hiç veri bulunamadı.");
        }

        log.info("Rapor DTO'su oluşturuldu ve döndürülüyor.");
        return InflationOverviewDTO.builder()
                .annualProducerPriceIndex(annualProducerPriceIndex.setScale(2, RoundingMode.HALF_UP))
                .purchasingPowerOf10k(purchasingPowerOf10k)
                .monthlyInflationTrend(monthlyTrend)
                .build();
    }

    // --- Rapor 2: Maliyet Analizi ---
    public CostAnalysisReportDTO getCostAnalysisReport(LocalDate startDate, LocalDate endDate, String tenantId, Optional<String> productionBatchId) {
        log.info("Maliyet Analizi Raporu oluşturuluyor. Aral?k: {} - {}, Tenant: {}, Parti ID: {}", startDate, endDate, tenantId, productionBatchId.orElse("Genel"));

        List<CostAnalysisReportDTO.DataPointDTO> marketTrend = calculateMarketInflationTrend(startDate, endDate);
        List<CostAnalysisReportDTO.DataPointDTO> businessTrend = calculateBusinessCostTrend(startDate, endDate, tenantId, productionBatchId);

        return CostAnalysisReportDTO.builder()
                .marketInflationTrend(marketTrend)
                .businessCostTrend(businessTrend)
                .build();
    }

    // --- Rapor 3: Satış Fiyatı Performansı ---
    public PricePerformanceReportDTO getPricePerformanceReport(LocalDate startDate, LocalDate endDate, String plantId, String tenantId) {
        log.info("Satış Fiyatı Performans Raporu oluşturuluyor. Aralık: {} - {}, Fidan ID: {}", startDate, endDate, plantId);

        List<Order.OrderItem> allSoldItems = orderRepository.findAllByTenantIdAndStatusInAndOrderDateBetweenAndItems_PlantId(
                        tenantId,
                        List.of(Order.OrderStatus.SHIPPED, Order.OrderStatus.DELIVERED),
                        startDate.atStartOfDay(),
                        endDate.atTime(23, 59, 59),
                        plantId
                ).stream()
                .flatMap(order -> order.getItems().stream()
                        .filter(item -> item.getPlantId().equals(plantId))
                        .peek(item -> item.setOrderDate(order.getOrderDate().toLocalDate())))
                .collect(Collectors.toList());

        if (allSoldItems.isEmpty()) {
            return PricePerformanceReportDTO.builder().priceTrend(Collections.emptyList()).build();
        }

        Order.OrderItem firstSale = allSoldItems.stream()
                .min(Comparator.comparing(Order.OrderItem::getOrderDate))
                .orElse(allSoldItems.get(0));

        BigDecimal basePrice = firstSale.getSalePrice();
        LocalDate baseDate = firstSale.getOrderDate();

        Map<String, List<Order.OrderItem>> salesByQuarter = allSoldItems.stream()
                .collect(Collectors.groupingBy(item ->
                        item.getOrderDate().getYear() + "-Ç" + item.getOrderDate().get(IsoFields.QUARTER_OF_YEAR)
                ));

        List<PricePerformanceReportDTO.DataPointDTO> trend = new ArrayList<>();

        for (Map.Entry<String, List<Order.OrderItem>> entry : salesByQuarter.entrySet()) {
            String quarterLabel = entry.getKey();
            List<Order.OrderItem> quarterSales = entry.getValue();

            BigDecimal totalRevenue = quarterSales.stream()
                    .map(item -> item.getSalePrice().multiply(new BigDecimal(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            int totalQuantity = quarterSales.stream().mapToInt(Order.OrderItem::getQuantity).sum();
            BigDecimal nominalPrice = totalRevenue.divide(new BigDecimal(totalQuantity), 2, RoundingMode.HALF_UP);

            LocalDate quarterDate = quarterSales.get(0).getOrderDate();
            BigDecimal shouldBePrice = inflationCalculationService.calculateRealValue(basePrice, baseDate, quarterDate);

            trend.add(PricePerformanceReportDTO.DataPointDTO.builder()
                    .label(quarterLabel)
                    .nominalPrice(nominalPrice)
                    .shouldBePrice(shouldBePrice)
                    .build());
        }

        trend.sort(Comparator.comparing(PricePerformanceReportDTO.DataPointDTO::getLabel));

        return PricePerformanceReportDTO.builder().priceTrend(trend).build();
    }


    // --- Private Helper Metotlar ---

    private List<CostAnalysisReportDTO.DataPointDTO> calculateMarketInflationTrend(LocalDate startDate, LocalDate endDate) {
        List<InflationData> inflationInRange = inflationDataRepository.findAll().stream()
                .filter(d -> !d.getDate().isBefore(startDate.withDayOfMonth(1)) && !d.getDate().isAfter(endDate.withDayOfMonth(1)))
                .sorted(Comparator.comparing(InflationData::getDate))
                .collect(Collectors.toList());

        if (inflationInRange.isEmpty()) return Collections.emptyList();

        BigDecimal baseValue = inflationInRange.get(0).getValue();
        List<CostAnalysisReportDTO.DataPointDTO> trend = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy", new Locale("tr"));

        for (InflationData data : inflationInRange) {
            BigDecimal indexValue = data.getValue().divide(baseValue, 4, RoundingMode.HALF_UP).multiply(HUNDRED);
            trend.add(CostAnalysisReportDTO.DataPointDTO.builder()
                    .label(data.getDate().format(formatter))
                    .indexValue(indexValue)
                    .build());
        }
        return trend;
    }

    private List<CostAnalysisReportDTO.DataPointDTO> calculateBusinessCostTrend(LocalDate startDate, LocalDate endDate, String tenantId, Optional<String> productionBatchId) {
        List<Expense> expenses;
        if (productionBatchId.isPresent() && !productionBatchId.get().isEmpty()) {
            expenses = expenseRepository.findAllByProductionBatchIdAndTenantIdAndExpenseDateBetweenOrderByExpenseDateAsc(productionBatchId.get(), tenantId, startDate, endDate);
        } else {
            expenses = expenseRepository.findAllByTenantIdAndExpenseDateBetweenOrderByExpenseDateAsc(tenantId, startDate, endDate);
        }

        if (expenses.isEmpty()) {
            return Collections.emptyList();
        }

        Map<YearMonth, BigDecimal> monthlyExpenses = expenses.stream()
                .collect(Collectors.groupingBy(
                        expense -> YearMonth.from(expense.getExpenseDate()),
                        LinkedHashMap::new,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));

        List<CostAnalysisReportDTO.DataPointDTO> trend = new ArrayList<>();
        BigDecimal cumulativeCost = BigDecimal.ZERO;
        BigDecimal baseCost = monthlyExpenses.values().stream()
                .filter(v -> v.compareTo(BigDecimal.ZERO) > 0)
                .findFirst()
                .orElse(BigDecimal.ONE);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy", new Locale("tr"));
        YearMonth startMonth = YearMonth.from(startDate);
        YearMonth endMonth = YearMonth.from(endDate);

        for (YearMonth currentMonth = startMonth; !currentMonth.isAfter(endMonth); currentMonth = currentMonth.plusMonths(1)) {
            BigDecimal expenseThisMonth = monthlyExpenses.getOrDefault(currentMonth, BigDecimal.ZERO);
            cumulativeCost = cumulativeCost.add(expenseThisMonth);

            BigDecimal indexValue = cumulativeCost.divide(baseCost, 4, RoundingMode.HALF_UP).multiply(HUNDRED);

            trend.add(CostAnalysisReportDTO.DataPointDTO.builder()
                    .label(currentMonth.format(formatter))
                    .indexValue(indexValue)
                    .build());
        }
        return trend;
    }
}