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

    // Anasayfadaki "Son Siparişler" tablosu için de bu DTO'yu kullanabiliriz
    // veya daha sonra ayrı bir endpoint oluşturabiliriz.
}
