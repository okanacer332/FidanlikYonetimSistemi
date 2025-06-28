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
    matcher: { type: 'startsWith', href: paths.dashboard.overview }, // Added matcher
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
        matcher: { type: 'startsWith', href: paths.dashboard.plants }, // Added matcher
      },
      {
        type: 'item',
        key: 'warehouses',
        title: 'Depo Yönetimi',
        href: paths.dashboard.warehouses,
        icon: 'buildings',
        roles: ['ADMIN', 'WAREHOUSE_STAFF'],
        matcher: { type: 'startsWith', href: paths.dashboard.warehouses }, // Added matcher
      },
      {
        type: 'item',
        key: 'production-batches', // Benzersiz bir anahtar
        title: 'Üretim Partileri', // Menüde görünecek başlık
        href: '/dashboard/production-batches', // Yeni sayfamızın yolu
        icon: 'stack', // Uygun bir ikon seçebilirsiniz, örnek olarak 'stack'
        roles: ['ADMIN', 'WAREHOUSE_STAFF'], // Bu sayfayı kimler görebilir?
        matcher: { type: 'startsWith', href: '/dashboard/production-batches' },
      },
      {
        type: 'item',
        key: 'customers',
        title: 'Müşteri Yönetimi',
        href: paths.dashboard.customers,
        icon: 'users',
        roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'],
        matcher: { type: 'startsWith', href: paths.dashboard.customers }, // Added matcher
      },
      {
        type: 'item',
        key: 'suppliers',
        title: 'Tedarikçi Yönetimi',
        href: paths.dashboard.suppliers,
        icon: 'package',
        roles: ['ADMIN', 'WAREHOUSE_STAFF'],
        matcher: { type: 'startsWith', href: paths.dashboard.suppliers }, // Added matcher
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
        matcher: { type: 'startsWith', href: paths.dashboard.accounting.currentAccounts }, // Added matcher
      },
      {
        type: 'item',
        key: 'supplier-accounts',
        title: 'Cari Hesaplar (Tedarikçi)',
        href: paths.dashboard.accounting.suppliers,
        icon: 'bank',
        roles: ['ADMIN', 'ACCOUNTANT'],
        matcher: { type: 'startsWith', href: paths.dashboard.accounting.suppliers }, // Added matcher
      },
      {
        type: 'item',
        key: 'inflation-rates', // Benzersiz bir anahtar
        title: 'Enflasyon Oranları', // Menüde görünecek başlık
        href: '/dashboard/accounting/inflation-rates', // Yeni sayfamızın yolu
        icon: 'chart-line', // Uygun bir ikon seçebilirsiniz, örnek olarak 'chart-line'
        roles: ['ADMIN', 'ACCOUNTANT'], // Bu sayfayı kimler görebilir?
        matcher: { type: 'startsWith', href: '/dashboard/accounting/inflation-rates' },
      },
      {
        type: 'item',
        key: 'invoices',
        title: 'Faturalar',
        href: paths.dashboard.accounting.invoices,
        icon: 'receipt',
        roles: ['ADMIN', 'ACCOUNTANT'],
        matcher: { type: 'startsWith', href: paths.dashboard.accounting.invoices }, // Added matcher
      },
      {
        type: 'item',
        key: 'payments',
        title: 'Kasa & Banka Hareketleri',
        href: paths.dashboard.accounting.payments,
        icon: 'credit-card',
        roles: ['ADMIN', 'ACCOUNTANT'],
        matcher: { type: 'startsWith', href: paths.dashboard.accounting.payments }, // Added matcher
      },
      {
        type: 'item',
        key: 'expenses',
        title: 'Gider Yönetimi',
        href: paths.dashboard.accounting.expenses,
        icon: 'chart-bar',
        roles: ['ADMIN', 'ACCOUNTANT'],
        matcher: { type: 'startsWith', href: paths.dashboard.accounting.expenses }, // Added matcher
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
        matcher: { type: 'startsWith', href: paths.dashboard.orders }, // Added matcher
      },
      {
        type: 'item',
        key: 'goods-receipts',
        title: 'Mal Girişi',
        href: paths.dashboard.goodsReceipts,
        icon: 'package',
        roles: ['ADMIN', 'WAREHOUSE_STAFF'],
        matcher: { type: 'startsWith', href: paths.dashboard.goodsReceipts }, // Added matcher
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
        matcher: { type: 'startsWith', href: paths.dashboard.reports.overview }, // Added matcher
      },
      {
        type: 'group',
        key: 'financial-reports',
        title: 'Finansal Raporlar',
        roles: ['ADMIN', 'ACCOUNTANT'],
        items: [
          { type: 'item', key: 'profitability', title: 'Karlılık Raporu', href: paths.dashboard.reports.financial.profitability, icon: 'chart-line', roles: ['ADMIN', 'ACCOUNTANT'], matcher: { type: 'startsWith', href: paths.dashboard.reports.financial.profitability } }, // Added matcher
          { type: 'item', key: 'cash-flow', title: 'Nakit Akış Raporu', href: paths.dashboard.reports.financial.cashFlow, icon: 'swap', roles: ['ADMIN', 'ACCOUNTANT'], matcher: { type: 'startsWith', href: paths.dashboard.reports.financial.cashFlow } }, // Added matcher
          { type: 'item', key: 'expense-analysis', title: 'Gider Analiz Raporu', href: paths.dashboard.reports.financial.expenseAnalysis, icon: 'chart-bar', roles: ['ADMIN', 'ACCOUNTANT'], matcher: { type: 'startsWith', href: paths.dashboard.reports.financial.expenseAnalysis } }, // Added matcher
          { type: 'item', key: 'receivables-aging', title: 'Vade Geçmiş Analizi', href: paths.dashboard.reports.financial.receivablesAging, icon: 'chart-bar', roles: ['ADMIN', 'ACCOUNTANT'], matcher: { type: 'startsWith', href: paths.dashboard.reports.financial.receivablesAging } }, // Added matcher
        ]
      },
      {
        type: 'group',
        key: 'sales-reports',
        title: 'Satış Raporları',
        roles: ['ADMIN', 'SALES'],
        items: [
          { type: 'item', key: 'detailed-sales', title: 'Detaylı Satış Raporu', href: paths.dashboard.reports.sales.detailedSales, icon: 'chart-line', roles: ['ADMIN', 'SALES'], matcher: { type: 'startsWith', href: paths.dashboard.reports.sales.detailedSales } }, // Added matcher
          { type: 'item', key: 'sales-by-customer', title: 'Müşteri Performansı', href: paths.dashboard.reports.sales.salesByCustomer, icon: 'chart-bar', roles: ['ADMIN', 'SALES'], matcher: { type: 'startsWith', href: paths.dashboard.reports.sales.salesByCustomer } }, // Added matcher
          { type: 'item', key: 'sales-by-product', title: 'Ürün Performansı', href: paths.dashboard.reports.sales.salesByProduct, icon: 'chart-bar', roles: ['ADMIN', 'SALES'], matcher: { type: 'startsWith', href: paths.dashboard.reports.sales.salesByProduct } }, // Added matcher
        ]
      },
      {
        type: 'group',
        key: 'inventory-reports',
        title: 'Stok Raporları',
        roles: ['ADMIN', 'WAREHOUSE_STAFF'],
        items: [
          { type: 'item', key: 'stock-valuation', title: 'Envanter Değer Raporu', href: paths.dashboard.reports.inventory.valuation, icon: 'chart-line', roles: ['ADMIN', 'WAREHOUSE_STAFF'], matcher: { type: 'startsWith', href: paths.dashboard.reports.inventory.valuation } }, // Added matcher
          { type: 'item', key: 'stock-movements', title: 'Stok Hareket Dökümü', href: paths.dashboard.reports.inventory.stockMovements, icon: 'swap', roles: ['ADMIN', 'WAREHOUSE_STAFF'], matcher: { type: 'startsWith', href: paths.dashboard.reports.inventory.stockMovements } }, // Added matcher
          { type: 'item', key: 'stock-aging', title: 'Stok Bekleme Süreleri', href: paths.dashboard.reports.inventory.stockAging, icon: 'chart-bar', roles: ['ADMIN', 'WAREHOUSE_STAFF'], matcher: { type: 'startsWith', href: paths.dashboard.reports.inventory.stockAging } }, // Added matcher
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
        matcher: { type: 'startsWith', href: paths.dashboard.userManagement }, // Added matcher
      },
      {
        type: 'item',
        key: 'settings',
        title: 'Ayarlar',
        href: paths.dashboard.settings,
        icon: 'gear-six',
        roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF', 'ACCOUNTANT'],
        matcher: { type: 'startsWith', href: paths.dashboard.settings }, // Added matcher
      },
      {
        type: 'item',
        key: 'integrations',
        title: 'Entegrasyonlar',
        href: paths.dashboard.integrations,
        icon: 'plugs-connected',
        roles: ['ADMIN'],
        matcher: { type: 'startsWith', href: paths.dashboard.integrations }, // Added matcher
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
    matcher: { type: 'startsWith', href: paths.dashboard.account }, // Added matcher
  },
];