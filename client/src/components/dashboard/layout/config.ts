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
      {
        type: 'item',
        key: 'plants',
        title: 'Fidan Yönetimi',
        href: paths.dashboard.plants,
        icon: 'tree-evergreen',
        roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'],
      },
      {
        type: 'item',
        key: 'warehouses',
        title: 'Depo Yönetimi',
        href: paths.dashboard.warehouses,
        icon: 'buildings',
        roles: ['ADMIN', 'WAREHOUSE_STAFF'],
      },
      {
        type: 'item',
        key: 'customers',
        title: 'Müşteri Yönetimi',
        href: paths.dashboard.customers,
        icon: 'users',
        roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'],
      },
      {
        type: 'item',
        key: 'suppliers',
        title: 'Tedarikçi Yönetimi',
        href: paths.dashboard.suppliers,
        icon: 'package',
        roles: ['ADMIN', 'WAREHOUSE_STAFF'],
      },
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
      },
      {
        type: 'item',
        key: 'supplier-accounts',
        title: 'Cari Hesaplar (Tedarikçi)',
        href: paths.dashboard.accounting.suppliers,
        icon: 'bank',
        roles: ['ADMIN', 'ACCOUNTANT'],
      },
      {
        type: 'item',
        key: 'invoices',
        title: 'Faturalar',
        href: paths.dashboard.accounting.invoices,
        icon: 'receipt',
        roles: ['ADMIN', 'ACCOUNTANT'],
      },
      {
        type: 'item',
        key: 'payments',
        title: 'Kasa & Banka Hareketleri',
        href: paths.dashboard.accounting.payments,
        icon: 'credit-card',
        roles: ['ADMIN', 'ACCOUNTANT'],
      },
      {
        type: 'item',
        key: 'expenses',
        title: 'Gider Yönetimi',
        href: paths.dashboard.accounting.expenses,
        icon: 'chart-bar',
        roles: ['ADMIN', 'ACCOUNTANT'],
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
      },
      {
        type: 'item',
        key: 'goods-receipts',
        title: 'Mal Girişi',
        href: paths.dashboard.goodsReceipts,
        icon: 'package',
        roles: ['ADMIN', 'WAREHOUSE_STAFF'],
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
      },
      {
        type: 'group',
        key: 'financial-reports',
        title: 'Finansal Raporlar',
        roles: ['ADMIN', 'ACCOUNTANT'],
        items: [
          { type: 'item', key: 'profitability', title: 'Karlılık Raporu', href: paths.dashboard.reports.financial.profitability, icon: 'chart-line', roles: ['ADMIN', 'ACCOUNTANT'] },
          { type: 'item', key: 'cash-flow', title: 'Nakit Akış Raporu', href: paths.dashboard.reports.financial.cashFlow, icon: 'swap', roles: ['ADMIN', 'ACCOUNTANT'] },
          { type: 'item', key: 'expense-analysis', title: 'Gider Analiz Raporu', href: paths.dashboard.reports.financial.expenseAnalysis, icon: 'chart-bar', roles: ['ADMIN', 'ACCOUNTANT'] },
          { type: 'item', key: 'receivables-aging', title: 'Vade Geçmiş Analizi', href: paths.dashboard.reports.financial.receivablesAging, icon: 'chart-bar', roles: ['ADMIN', 'ACCOUNTANT'] },
        ]
      },
      {
        type: 'group',
        key: 'sales-reports',
        title: 'Satış Raporları',
        roles: ['ADMIN', 'SALES'],
        items: [
          { type: 'item', key: 'detailed-sales', title: 'Detaylı Satış Raporu', href: paths.dashboard.reports.sales.detailedSales, icon: 'chart-line', roles: ['ADMIN', 'SALES'] },
          { type: 'item', key: 'sales-by-customer', title: 'Müşteri Performansı', href: paths.dashboard.reports.sales.salesByCustomer, icon: 'chart-bar', roles: ['ADMIN', 'SALES'] },
          { type: 'item', key: 'sales-by-product', title: 'Ürün Performansı', href: paths.dashboard.reports.sales.salesByProduct, icon: 'chart-bar', roles: ['ADMIN', 'SALES'] },
        ]
      },
      {
        type: 'group',
        key: 'inventory-reports',
        title: 'Stok Raporları',
        roles: ['ADMIN', 'WAREHOUSE_STAFF'],
        items: [
          { type: 'item', key: 'stock-valuation', title: 'Envanter Değer Raporu', href: paths.dashboard.reports.inventory.valuation, icon: 'chart-line', roles: ['ADMIN', 'WAREHOUSE_STAFF'] },
          { type: 'item', key: 'stock-movements', title: 'Stok Hareket Dökümü', href: paths.dashboard.reports.inventory.stockMovements, icon: 'swap', roles: ['ADMIN', 'WAREHOUSE_STAFF'] },
          { type: 'item', key: 'stock-aging', title: 'Stok Bekleme Süreleri', href: paths.dashboard.reports.inventory.stockAging, icon: 'chart-bar', roles: ['ADMIN', 'WAREHOUSE_STAFF'] },
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
      },
      {
        type: 'item',
        key: 'settings',
        title: 'Ayarlar',
        href: paths.dashboard.settings,
        icon: 'gear-six',
        roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF', 'ACCOUNTANT'], // Genel ayarlar, herkes erişebilir
      },
      {
        type: 'item',
        key: 'integrations',
        title: 'Entegrasyonlar',
        href: paths.dashboard.integrations,
        icon: 'plugs-connected',
        roles: ['ADMIN'],
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
  },
];