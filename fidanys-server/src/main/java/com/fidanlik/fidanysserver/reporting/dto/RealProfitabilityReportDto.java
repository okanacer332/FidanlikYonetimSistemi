package com.fidanlik.fidanysserver.reporting.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class RealProfitabilityReportDto {
    private String orderId;
    private String orderNumber;
    private LocalDateTime saleDate;
    private String plantId;
    private String plantName;
    private int quantitySold;
    private BigDecimal salePrice; // Birim satış fiyatı
    private BigDecimal totalRevenue; // Toplam Gelir (quantity * salePrice)

    // Maliyet Analizi
    private BigDecimal nominalUnitCost; // Satış anındaki anlık birim maliyet
    private BigDecimal realUnitCost;    // Satış anındaki enflasyona göre düzeltilmiş reel birim maliyet
    private BigDecimal totalNominalCost; // Toplam nominal maliyet
    private BigDecimal totalRealCost;    // Toplam reel maliyet

    // Kârlılık Analizi
    private BigDecimal nominalProfit; // Nominal Kâr
    private BigDecimal realProfit;    // Reel Kâr
    private BigDecimal inflationDifference; // Enflasyonun maliyete etkisi (Reel Maliyet - Nominal Maliyet)
}