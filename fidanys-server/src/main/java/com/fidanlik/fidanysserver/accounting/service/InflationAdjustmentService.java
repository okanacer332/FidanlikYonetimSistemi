package com.fidanlik.fidanysserver.accounting.service;

import com.fidanlik.fidanysserver.accounting.model.InflationRate;
import com.fidanlik.fidanysserver.accounting.repository.InflationRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InflationAdjustmentService {

    private final InflationRateRepository inflationRateRepository;

    /**
     * Belirli bir tarihteki maliyeti, hedeflenen tarihe kadar olan enflasyon oranlarıyla düzeltir.
     * @param originalCost Düzeltilecek orijinal maliyet
     * @param costDate Maliyetin yapıldığı tarih
     * @param adjustmentDate Maliyetin düzeltileceği hedef tarih
     * @param tenantId İşlem yapılan tenant'ın ID'si
     * @return Enflasyona göre düzeltilmiş yeni maliyet
     */
    public BigDecimal adjustCostForInflation(BigDecimal originalCost, LocalDate costDate, LocalDate adjustmentDate, String tenantId) {
        // Eğer maliyet veya tarihler null ise veya maliyet sıfır ise, orijinal maliyeti geri dön.
        if (originalCost == null || costDate == null || adjustmentDate == null || originalCost.compareTo(BigDecimal.ZERO) == 0) {
            return originalCost;
        }

        // Eğer hedef tarih, maliyet tarihinden önceyse veya aynı aydaysa, düzeltme yapma.
        if (adjustmentDate.isBefore(costDate) || (costDate.getYear() == adjustmentDate.getYear() && costDate.getMonth() == adjustmentDate.getMonth())) {
            return originalCost;
        }

        // İlgili aralıktaki tüm enflasyon oranlarını veritabanından çek.
        // Önce yıla, sonra aya göre sıralayarak doğru sırayla uygulandığından emin ol.
        List<InflationRate> rates = inflationRateRepository.findAll(); // Gerçek uygulamada tenantId ve tarih aralığı ile sorgulanmalı

        // Basitlik adına tüm oranları çekip filtreliyoruz. Performans için repoda sorgu yazılabilir.
        List<InflationRate> applicableRates = rates.stream()
                .filter(rate -> rate.getTenantId().equals(tenantId) && isDateInRange(rate, costDate, adjustmentDate))
                .sorted((r1, r2) -> {
                    int yearCompare = Integer.compare(r1.getYear(), r2.getYear());
                    if (yearCompare == 0) {
                        return Integer.compare(r1.getMonth(), r2.getMonth());
                    }
                    return yearCompare;
                })
                .collect(Collectors.toList());

        if (applicableRates.isEmpty()) {
            return originalCost; // Arada hiç enflasyon verisi yoksa düzeltme yapma.
        }

        BigDecimal adjustedCost = originalCost;
        BigDecimal hundred = new BigDecimal("100");

        // Her bir ayın enflasyon oranını kümülatif olarak uygula.
        for (InflationRate rate : applicableRates) {
            // Oran = %5 ise, (1 + 5/100) = 1.05 ile çarpılır.
            BigDecimal multiplier = BigDecimal.ONE.add(rate.getRate().divide(hundred, 4, RoundingMode.HALF_UP));
            adjustedCost = adjustedCost.multiply(multiplier);
        }

        // Sonucu 2 ondalık basamağa yuvarla.
        return adjustedCost.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Bir enflasyon oranının, belirtilen iki tarih arasında olup olmadığını kontrol eden yardımcı metot.
     */
    private boolean isDateInRange(InflationRate rate, LocalDate startDate, LocalDate endDate) {
        LocalDate rateDate = LocalDate.of(rate.getYear(), rate.getMonth(), 1);

        // Başlangıç tarihinden sonra (veya aynı ay/yıl) VE bitiş tarihinden önce olmalı.
        // Düzeltme, maliyetin yapıldığı aydan sonraki aydan itibaren başlar.
        return !rateDate.isBefore(startDate.withDayOfMonth(1).plusMonths(1)) && !rateDate.isAfter(endDate.withDayOfMonth(1));
    }
}