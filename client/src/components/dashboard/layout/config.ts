// Konum: src/components/dashboard/layout/config.ts
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
  // --- YENİ SIRALAMA: En sık kullanılan modül olan Operasyonlar en üste taşındı ---
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
        href: paths.dashboard.operasyonlar.orders,
        icon: 'shopping-cart',
        roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'],
      },
      {
        type: 'item',
        key: 'goods-receipts',
        title: 'Mal Girişi',
        href: paths.dashboard.operasyonlar.goodsReceipts,
        icon: 'package',
        roles: ['ADMIN', 'WAREHOUSE_STAFF'],
      },
      {
        type: 'item',
        key: 'production-batches',
        title: 'Üretim Partileri',
        href: paths.dashboard.operasyonlar.productionBatches,
        icon: 'wrench',
        roles: ['ADMIN', 'WAREHOUSE_STAFF'],
      },
      {
        type: 'item',
        key: 'stock-status',
        title: 'Stok Durumu',
        href: paths.dashboard.operasyonlar.stockStatus,
        icon: 'stack',
        roles: ['ADMIN', 'WAREHOUSE_STAFF', 'SALES', 'ACCOUNTANT'],
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
        href: paths.dashboard.muhasebe.currentAccounts,
        icon: 'bank',
        roles: ['ADMIN', 'ACCOUNTANT'],
      },
      {
        type: 'item',
        key: 'supplier-accounts',
        title: 'Cari Hesaplar (Tedarikçi)',
        href: paths.dashboard.muhasebe.suppliers,
        icon: 'bank',
        roles: ['ADMIN', 'ACCOUNTANT'],
      },
      {
        type: 'item',
        key: 'invoices',
        title: 'Faturalar',
        href: paths.dashboard.muhasebe.invoices,
        icon: 'receipt',
        roles: ['ADMIN', 'ACCOUNTANT'],
      },
      {
        type: 'item',
        key: 'payments',
        title: 'Kasa & Banka Hareketleri',
        href: paths.dashboard.muhasebe.payments,
        icon: 'credit-card',
        roles: ['ADMIN', 'ACCOUNTANT'],
      },
      {
        type: 'item',
        key: 'expenses',
        title: 'Gider Yönetimi',
        href: paths.dashboard.muhasebe.expenses,
        icon: 'chart-bar',
        roles: ['ADMIN', 'ACCOUNTANT'],
      },
    ],
  },
  // --- YENİ YAPI: "Tanımlar" menüsü artık tüm temel verileri içeriyor ---
  {
    type: 'group',
    key: 'definitions',
    title: 'Tanımlar',
    roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF', 'ACCOUNTANT'],
    items: [
      { type: 'item', key: 'plants', title: 'Fidan Yönetimi', href: paths.dashboard.tanimlar.plants, icon: 'tree-evergreen', roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'] },
      { type: 'item', key: 'warehouses', title: 'Depo Yönetimi', href: paths.dashboard.tanimlar.warehouses, icon: 'buildings', roles: ['ADMIN', 'WAREHOUSE_STAFF'] },
      { type: 'item', key: 'customers', title: 'Müşteri Yönetimi', href: paths.dashboard.tanimlar.customers, icon: 'users', roles: ['ADMIN', 'SALES'] },
      { type: 'item', key: 'suppliers', title: 'Tedarikçi Yönetimi', href: paths.dashboard.tanimlar.suppliers, icon: 'package', roles: ['ADMIN', 'WAREHOUSE_STAFF'] },
      { type: 'item', key: 'expense-categories', title: 'Gider Kategorileri', href: paths.dashboard.tanimlar.expenseCategories, icon: 'stack', roles: ['ADMIN', 'ACCOUNTANT'] },
      { type: 'item', key: 'inflation-data', title: 'Enflasyon Verileri', href: paths.dashboard.tanimlar.inflationData, icon: 'chart-line', roles: ['ADMIN', 'ACCOUNTANT'] },
    ],
  },
  {
    type: 'group',
    key: 'reports',
    title: 'Raporlar',
    roles: ['ADMIN', 'ACCOUNTANT'],
    items: [
      { type: 'item', key: 'inflation-overview', title: 'Enflasyon Genel Bakış', href: paths.dashboard.raporlar.inflationOverview, icon: 'chart-line', roles: ['ADMIN', 'ACCOUNTANT'] },
      { type: 'item', key: 'cost-analysis', title: 'Maliyet Analizi', href: paths.dashboard.raporlar.costAnalysis, icon: 'chart-line', roles: ['ADMIN', 'ACCOUNTANT'] },
      { type: 'item', key: 'price-performance', title: 'Fiyat Performansı', href: paths.dashboard.raporlar.pricePerformance, icon: 'chart-bar', roles: ['ADMIN', 'ACCOUNTANT'] },
    ],
  },
  { 
  type: 'item', 
  key: 'profitability-report', 
  title: 'Kar/Zarar Analizi', 
  href: paths.dashboard.raporlar.profitability, 
  icon: 'chart-bar', 
  roles: ['ADMIN', 'ACCOUNTANT'] 
},
  // --- YENİ YAPI: "Sistem" menüsü sadeleştirildi ---
  {
    type: 'group',
    key: 'system',
    title: 'Sistem',
    roles: ['ADMIN'],
    items: [
      { type: 'item', key: 'user-management', title: 'Kullanıcı Yönetimi', href: paths.dashboard.sistem.userManagement, icon: 'users', roles: ['ADMIN'] },
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