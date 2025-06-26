package com.fidanlik.fidanysserver.reporting.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OverviewReportDto {
    // Üstteki Kartlar İçin Veriler
    private long totalCustomers;
    private BigDecimal totalSales;
    private long totalOrders;
    private long totalPlantsInStock;

    // --- YENİ EKLENEN ALANLAR ---
    private BigDecimal netProfit;
    private long newCustomers;

    // Not: Bu DTO, hem anasayfa (/dashboard) hem de yeni raporlar sayfası (/dashboard/reports)
    // için gerekli tüm özet metrikleri içerecek şekilde genişletilebilir.
}