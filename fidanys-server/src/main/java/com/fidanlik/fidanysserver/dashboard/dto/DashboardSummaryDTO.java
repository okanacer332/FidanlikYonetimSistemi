package com.fidanlik.fidanysserver.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL) // Sadece dolu olan alanları JSON'a dahil et
public class DashboardSummaryDTO {

    // --- Admin Alanları ---
    private BigDecimal totalRevenueLast30Days;
    private BigDecimal totalExpensesThisMonth;
    private BigDecimal totalStockValue;
    private Long pendingOrdersCount;
    private List<TopSellingPlantDTO> topSellingPlants;

    // --- Muhasebeci Alanları ---
    private BigDecimal overdueInvoicesTotal;
    private List<DailyCashFlowDTO> last7DaysCashFlow;
    private Map<String, BigDecimal> expenseDistribution; // Kategori Adı, Toplam Tutar
    private BigDecimal unpaidSupplierDebt;

    // --- Depocu Alanları ---
    private Long criticalStockCount;
    private Long ordersToShipToday;
    private Long recentGoodsReceiptsCount;
    private List<StockByWarehouseDTO> stockDistribution;

    // --- Diğer DTO'lar (Bu dosyanın içinde alt sınıf olarak tanımlayabiliriz) ---

    @Data
    @Builder
    public static class TopSellingPlantDTO {
        private String plantName;
        private int totalSold;
    }

    @Data
    @Builder
    public static class DailyCashFlowDTO {
        private String date; // "YYYY-AA" formatında
        private BigDecimal income; // double -> BigDecimal
        private BigDecimal outcome; // double -> BigDecimal
    }

    @Data
    @Builder
    public static class StockByWarehouseDTO {
        private String warehouseName;
        private int plantCount;
    }
}