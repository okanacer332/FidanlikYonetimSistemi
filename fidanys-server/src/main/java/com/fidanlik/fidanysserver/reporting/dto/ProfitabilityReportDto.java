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
    private BigDecimal totalCost;    // Toplam Maliyet
    private BigDecimal totalProfit;  // Toplam Kâr
}