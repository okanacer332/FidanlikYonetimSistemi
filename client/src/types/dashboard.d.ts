// Bu dosya, backend DTO'muzun frontend'deki TypeScript karşılığıdır.

export interface DashboardSummaryDTO {
  // Admin Alanları
  totalRevenueLast30Days?: number;
  totalExpensesThisMonth?: number;
  totalStockValue?: number;
  pendingOrdersCount?: number;
  topSellingPlants?: TopSellingPlantDTO[];

  // Muhasebeci Alanları
  overdueInvoicesTotal?: number;
  last7DaysCashFlow?: DailyCashFlowDTO[];
  expenseDistribution?: Record<string, number>; // Map<String, BigDecimal> -> Record<string, number>
  unpaidSupplierDebt?: number;

  // Depocu Alanları
  criticalStockCount?: number;
  ordersToShipToday?: number;
  recentGoodsReceiptsCount?: number;
  stockDistribution?: StockByWarehouseDTO[];
}

export interface TopSellingPlantDTO {
  plantName: string;
  totalSold: number;
}

export interface DailyCashFlowDTO {
  date: string;
  income: number;
  outcome: number;
}

export interface StockByWarehouseDTO {
  warehouseName: string;
  plantCount: number;
}