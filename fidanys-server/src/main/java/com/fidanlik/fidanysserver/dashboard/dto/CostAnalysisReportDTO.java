package com.fidanlik.fidanysserver.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

// Bu DTO, "Maliyet Analizi" raporunun grafiği için gerekli tüm verileri taşır.
@Data
@Builder
public class CostAnalysisReportDTO {

    private List<DataPointDTO> marketInflationTrend; // Piyasa enflasyon verisi (Yeşil Çizgi)
    private List<DataPointDTO> businessCostTrend;    // İşletme maliyet verisi (Mavi Çizgi)

    // Grafik üzerindeki her bir noktayı temsil eden alt DTO
    @Data
    @Builder
    public static class DataPointDTO {
        private String label;           // X ekseni etiketi (örn: "Oca 2024")
        private BigDecimal indexValue;  // Y ekseni değeri (Endeks değeri, 100'den başlar)
    }
}