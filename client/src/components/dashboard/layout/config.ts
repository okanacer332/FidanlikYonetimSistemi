import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems: NavItemConfig[] = [
  {
    type: 'item',
    key: 'overview',
    title: 'Anasayfa',
    href: paths.dashboard.overview,
    icon: 'chart-pie',
    roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF', 'ACCOUNTANT'],
  },
  {
    type: 'group',
    key: 'definitions',
    title: 'Tanımlar',
    roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'],
    items: [
        //... (mevcut Tanımlar menüsü aynı kalacak)
    ],
  },
  {
    type: 'group',
    key: 'accounting',
    title: 'Muhasebe',
    roles: ['ADMIN', 'ACCOUNTANT'],
    items: [
        //... (mevcut Muhasebe menüsü aynı kalacak)
    ],
  },
  {
    type: 'group',
    key: 'operations',
    title: 'Operasyonlar',
    roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'],
    items: [
        //... (mevcut Operasyonlar menüsü aynı kalacak)
    ],
  },
  // --- YENİ RAPORLAR MENÜSÜ ---
  {
    type: 'group',
    key: 'reports',
    title: 'Raporlar',
    roles: ['ADMIN', 'ACCOUNTANT', 'SALES'],
    items: [
      {
        type: 'item',
        key: 'reports-overview',
        title: 'Genel Bakış',
        href: paths.dashboard.reports.overview,
        icon: 'chart-bar',
      },
      {
        type: 'group',
        key: 'financial-reports',
        title: 'Finansal Raporlar',
        roles: ['ADMIN', 'ACCOUNTANT'],
        items: [
          { type: 'item', key: 'profitability', title: 'Karlılık Raporu', href: paths.dashboard.reports.financial.profitability },
          { type: 'item', key: 'cash-flow', title: 'Nakit Akış Raporu', href: paths.dashboard.reports.financial.cashFlow },
          { type: 'item', key: 'expense-analysis', title: 'Gider Analiz Raporu', href: paths.dashboard.reports.financial.expenseAnalysis },
          { type: 'item', key: 'receivables-aging', title: 'Vade Geçmiş Analizi', href: paths.dashboard.reports.financial.receivablesAging },
        ]
      },
      {
        type: 'group',
        key: 'sales-reports',
        title: 'Satış Raporları',
        roles: ['ADMIN', 'SALES'],
        items: [
          { type: 'item', key: 'detailed-sales', title: 'Detaylı Satış Raporu', href: paths.dashboard.reports.sales.detailedSales },
          { type: 'item', key: 'sales-by-customer', title: 'Müşteri Performansı', href: paths.dashboard.reports.sales.salesByCustomer },
          { type: 'item', key: 'sales-by-product', title: 'Ürün Performansı', href: paths.dashboard.reports.sales.salesByProduct },
        ]
      },
      {
        type: 'group',
        key: 'inventory-reports',
        title: 'Stok Raporları',
        roles: ['ADMIN', 'WAREHOUSE_STAFF'],
        items: [
          { type: 'item', key: 'stock-valuation', title: 'Envanter Değer Raporu', href: paths.dashboard.reports.inventory.valuation },
          { type: 'item', key: 'stock-movements', title: 'Stok Hareket Dökümü', href: paths.dashboard.reports.inventory.stockMovements },
          { type: 'item', key: 'stock-aging', title: 'Stok Bekleme Süreleri', href: paths.dashboard.reports.inventory.stockAging },
        ]
      },
    ]
  },
  // --- SİSTEM VE PROFİLİM MENÜLERİ ---
  {
    type: 'group',
    key: 'system',
    title: 'Sistem',
    roles: ['ADMIN'],
    items: [
        //... (mevcut Sistem menüsü aynı kalacak)
    ],
  },
  {
    type: 'item',
    key: 'account',
    title: 'Profilim',
    href: paths.dashboard.account,
    icon: 'user',
    roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF', 'ACCOUNTANT'],
  },
];