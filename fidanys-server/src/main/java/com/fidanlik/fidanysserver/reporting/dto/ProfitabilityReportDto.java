package com.fidanlik.fidanysserver.reporting.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ProfitabilityReportDto {
    private String plantId;
    private String plantName;
    private int totalQuantitySold;
    private BigDecimal totalRevenue; // Toplam Satış Hasılatı
    private BigDecimal totalCost;    // Mevcut nominal toplam maliyet (fire ve diğer giderler dahil)
    private BigDecimal totalProfit;  // Nominal Toplam Kâr

    // YENİ EKLENEN ALANLAR
    private BigDecimal nominalCost;     // Tarihsel (nominal) maliyet
    private BigDecimal realCost;        // Enflasyonla düzeltilmiş (reel) maliyet
    private BigDecimal nominalProfit;   // Nominal Kâr (totalRevenue - nominalCost)
    private BigDecimal realProfit;      // Reel Kâr (totalRevenue - realCost)
    private BigDecimal erodedValue;     // Eriyen Değer (realCost - nominalCost)
}