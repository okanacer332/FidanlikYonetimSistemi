package com.fidanlik.fidanysserver.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

// "Satış Fiyatı Performansı" raporunun verilerini taşır.
@Data
@Builder
public class PricePerformanceReportDTO {

    private List<DataPointDTO> priceTrend;

    // Her bir zaman dilimindeki (örn: çeyrek) fiyat verisini temsil eder.
    @Data
    @Builder
    public static class DataPointDTO {
        private String label;           // X ekseni etiketi (örn: "2024-Ç1")
        private BigDecimal nominalPrice;  // O dönemdeki ortalama satış fiyatı (Mavi Sütun)
        private BigDecimal shouldBePrice; // Enflasyona göre olması gereken fiyat (Yeşil Sütun)
    }
}