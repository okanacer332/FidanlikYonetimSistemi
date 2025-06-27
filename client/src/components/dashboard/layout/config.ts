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
    matcher: { type: 'startsWith', href: paths.dashboard.overview },
  },
  {
    type: 'group',
    key: 'definitions',
    title: 'Tanımlar',
    roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF', 'ACCOUNTANT'], // Accountant rolü eklendi
    items: [
      {
        type: 'item',
        key: 'plants',
        title: 'Fidan Yönetimi',
        href: paths.dashboard.definitions.plants, // Yol güncellendi
        icon: 'tree-evergreen',
        roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'],
        matcher: { type: 'startsWith', href: paths.dashboard.definitions.plants }, // Yol güncellendi
      },
      {
        type: 'item',
        key: 'warehouses',
        title: 'Depo Yönetimi',
        href: paths.dashboard.definitions.warehouses, // Yol güncellendi
        icon: 'buildings',
        roles: ['ADMIN', 'WAREHOUSE_STAFF'],
        matcher: { type: 'startsWith', href: paths.dashboard.definitions.warehouses }, // Yol güncellendi
      },
      {
        type: 'item',
        key: 'customers',
        title: 'Müşteri Yönetimi',
        href: paths.dashboard.customers,
        icon: 'users',
        roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'],
        matcher: { type: 'startsWith', href: paths.dashboard.customers },
      },
      {
        type: 'item',
        key: 'suppliers',
        title: 'Tedarikçi Yönetimi',
        href: paths.dashboard.suppliers,
        icon: 'package',
        roles: ['ADMIN', 'WAREHOUSE_STAFF'],
        matcher: { type: 'startsWith', href: paths.dashboard.suppliers },
      },
      // --- YENİ MENÜ ELEMANI EKLENDİ ---
      {
        type: 'item',
        key: 'inflation-rates',
        title: 'Enflasyon Oranları',
        href: paths.dashboard.definitions.inflationRates,
        icon: 'chart-line', // Geçerli ikon kullanıldı
        roles: ['ADMIN', 'ACCOUNTANT'],
        matcher: { type: 'startsWith', href: paths.dashboard.definitions.inflationRates },
      },
      // --- BİTİŞ ---
    ],
  },
  {
    type: 'group',
    key: 'accounting',
    title: 'Muhasebe',
    roles: ['ADMIN', 'ACCOUNTANT'],
    items: [
      {
        type: 'item',
        key: 'current-accounts',
        title: 'Cari Hesaplar (Müşteri)',
        href: paths.dashboard.accounting.currentAccounts,
        icon: 'bank',
        roles: ['ADMIN', 'ACCOUNTANT'],
        matcher: { type: 'startsWith', href: paths.dashboard.accounting.currentAccounts },
      },
      {
        type: 'item',
        key: 'supplier-accounts',
        title: 'Cari Hesaplar (Tedarikçi)',
        href: paths.dashboard.accounting.suppliers,
        icon: 'bank',
        roles: ['ADMIN', 'ACCOUNTANT'],
        matcher: { type: 'startsWith', href: paths.dashboard.accounting.suppliers },
      },
      {
        type: 'item',
        key: 'invoices',
        title: 'Faturalar',
        href: paths.dashboard.accounting.invoices,
        icon: 'receipt',
        roles: ['ADMIN', 'ACCOUNTANT'],
        matcher: { type: 'startsWith', href: paths.dashboard.accounting.invoices },
      },
      {
        type: 'item',
        key: 'payments',
        title: 'Kasa & Banka Hareketleri',
        href: paths.dashboard.accounting.payments,
        icon: 'credit-card',
        roles: ['ADMIN', 'ACCOUNTANT'],
        matcher: { type: 'startsWith', href: paths.dashboard.accounting.payments },
      },
      {
        type: 'item',
        key: 'expenses',
        title: 'Gider Yönetimi',
        href: paths.dashboard.accounting.expenses,
        icon: 'chart-bar',
        roles: ['ADMIN', 'ACCOUNTANT'],
        matcher: { type: 'startsWith', href: paths.dashboard.accounting.expenses },
      },
    ],
  },
  {
    type: 'group',
    key: 'operations',
    title: 'Operasyonlar',
    roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'],
    items: [
      {
        type: 'item',
        key: 'orders',
        title: 'Sipariş Yönetimi',
        href: paths.dashboard.orders,
        icon: 'shopping-cart',
        roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'],
        matcher: { type: 'startsWith', href: paths.dashboard.orders },
      },
      {
        type: 'item',
        key: 'goods-receipts',
        title: 'Mal Girişi',
        href: paths.dashboard.goodsReceipts,
        icon: 'package',
        roles: ['ADMIN', 'WAREHOUSE_STAFF'],
        matcher: { type: 'startsWith', href: paths.dashboard.goodsReceipts },
      },
    ],
  },
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
        roles: ['ADMIN', 'ACCOUNTANT', 'SALES'],
        matcher: { type: 'startsWith', href: paths.dashboard.reports.overview },
      },
      {
        type: 'group',
        key: 'financial-reports',
        title: 'Finansal Raporlar',
        roles: ['ADMIN', 'ACCOUNTANT'],
        items: [
          { type: 'item', key: 'profitability', title: 'Karlılık Raporu', href: paths.dashboard.reports.financial.profitability, icon: 'chart-line', roles: ['ADMIN', 'ACCOUNTANT'], matcher: { type: 'startsWith', href: paths.dashboard.reports.financial.profitability } },
          { type: 'item', key: 'real-profitability', title: 'Reel Kârlılık Raporu', href: paths.dashboard.reports.financial.realProfitability, icon: 'chart-bar', roles: ['ADMIN'], matcher: { type: 'startsWith', href: paths.dashboard.reports.financial.realProfitability } },
          { type: 'item', key: 'cash-flow', title: 'Nakit Akış Raporu', href: paths.dashboard.reports.financial.cashFlow, icon: 'swap', roles: ['ADMIN', 'ACCOUNTANT'], matcher: { type: 'startsWith', href: paths.dashboard.reports.financial.cashFlow } },
          { type: 'item', key: 'expense-analysis', title: 'Gider Analiz Raporu', href: paths.dashboard.reports.financial.expenseAnalysis, icon: 'chart-bar', roles: ['ADMIN', 'ACCOUNTANT'], matcher: { type: 'startsWith', href: paths.dashboard.reports.financial.expenseAnalysis } },
          { type: 'item', key: 'receivables-aging', title: 'Vade Geçmiş Analizi', href: paths.dashboard.reports.financial.receivablesAging, icon: 'chart-bar', roles: ['ADMIN', 'ACCOUNTANT'], matcher: { type: 'startsWith', href: paths.dashboard.reports.financial.receivablesAging } },
        ]
      },
      {
        type: 'group',
        key: 'sales-reports',
        title: 'Satış Raporları',
        roles: ['ADMIN', 'SALES'],
        items: [
          { type: 'item', key: 'detailed-sales', title: 'Detaylı Satış Raporu', href: paths.dashboard.reports.sales.detailedSales, icon: 'chart-line', roles: ['ADMIN', 'SALES'], matcher: { type: 'startsWith', href: paths.dashboard.reports.sales.detailedSales } },
          { type: 'item', key: 'sales-by-customer', title: 'Müşteri Performansı', href: paths.dashboard.reports.sales.salesByCustomer, icon: 'chart-bar', roles: ['ADMIN', 'SALES'], matcher: { type: 'startsWith', href: paths.dashboard.reports.sales.salesByCustomer } },
          { type: 'item', key: 'sales-by-product', title: 'Ürün Performansı', href: paths.dashboard.reports.sales.salesByProduct, icon: 'chart-bar', roles: ['ADMIN', 'SALES'], matcher: { type: 'startsWith', href: paths.dashboard.reports.sales.salesByProduct } },
        ]
      },
      {
        type: 'group',
        key: 'inventory-reports',
        title: 'Stok Raporları',
        roles: ['ADMIN', 'WAREHOUSE_STAFF'],
        items: [
          { type: 'item', key: 'stock-valuation', title: 'Envanter Değer Raporu', href: paths.dashboard.reports.inventory.valuation, icon: 'chart-line', roles: ['ADMIN', 'WAREHOUSE_STAFF'], matcher: { type: 'startsWith', href: paths.dashboard.reports.inventory.valuation } },
          { type: 'item', key: 'stock-movements', title: 'Stok Hareket Dökümü', href: paths.dashboard.reports.inventory.stockMovements, icon: 'swap', roles: ['ADMIN', 'WAREHOUSE_STAFF'], matcher: { type: 'startsWith', href: paths.dashboard.reports.inventory.stockMovements } },
          { type: 'item', key: 'stock-aging', title: 'Stok Bekleme Süreleri', href: paths.dashboard.reports.inventory.stockAging, icon: 'chart-bar', roles: ['ADMIN', 'WAREHOUSE_STAFF'], matcher: { type: 'startsWith', href: paths.dashboard.reports.inventory.stockAging } },
        ]
      },
    ]
  },
  {
    type: 'group',
    key: 'system',
    title: 'Sistem',
    roles: ['ADMIN'],
    items: [
      {
        type: 'item',
        key: 'user-management',
        title: 'Kullanıcı Yönetimi',
        href: paths.dashboard.userManagement,
        icon: 'users',
        roles: ['ADMIN'],
        matcher: { type: 'startsWith', href: paths.dashboard.userManagement },
      },
      {
        type: 'item',
        key: 'settings',
        title: 'Ayarlar',
        href: paths.dashboard.settings,
        icon: 'gear-six',
        roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF', 'ACCOUNTANT'],
        matcher: { type: 'startsWith', href: paths.dashboard.settings },
      },
      {
        type: 'item',
        key: 'integrations',
        title: 'Entegrasyonlar',
        href: paths.dashboard.integrations,
        icon: 'plugs-connected',
        roles: ['ADMIN'],
        matcher: { type: 'startsWith', href: paths.dashboard.integrations },
      },
    ],
  },
  {
    type: 'item',
    key: 'account',
    title: 'Profilim',
    href: paths.dashboard.account,
    icon: 'user',
    roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF', 'ACCOUNTANT'],
    matcher: { type: 'startsWith', href: paths.dashboard.account },
  },
];