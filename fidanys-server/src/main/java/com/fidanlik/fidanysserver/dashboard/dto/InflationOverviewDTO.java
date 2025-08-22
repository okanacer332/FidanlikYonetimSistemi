package com.fidanlik.fidanysserver.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

// Bu DTO, "Enflasyon Genel Bakış" raporu için gerekli tüm verileri içerir.
@Data
@Builder
public class InflationOverviewDTO {

    // "Hız Göstergesi" için yıllık Yİ-ÜFE oranı (%68.45 gibi)
    private BigDecimal annualProducerPriceIndex;

    // "Paranın Değer Kaybı" kartı için hesaplanmış değer (5882 TL gibi)
    private BigDecimal purchasingPowerOf10k;

    // "Aylık Trend Grafiği" için son 24 ayın verisi
    private List<MonthlyInflationRateDTO> monthlyInflationTrend;

    // İç içe kullanılacak olan aylık veri DTO'su
    @Data
    @Builder
    public static class MonthlyInflationRateDTO {
        // "Oca 2024", "Şub 2024" gibi etiketler için
        private String monthYear;
        // O ayki % enflasyon oranı
        private BigDecimal rate;
    }
}