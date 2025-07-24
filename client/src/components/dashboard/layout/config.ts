// client/src/components/dashboard/layout/config.ts
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
    roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'],
    items: [
      {
        type: 'item',
        key: 'plants',
        title: 'Fidan Yönetimi',
        href: paths.dashboard.plants,
        icon: 'tree-evergreen',
        roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'],
        matcher: { type: 'startsWith', href: paths.dashboard.plants },
      },
      {
        type: 'item',
        key: 'warehouses',
        title: 'Depo Yönetimi',
        href: paths.dashboard.warehouses,
        icon: 'buildings',
        roles: ['ADMIN', 'WAREHOUSE_STAFF'],
        matcher: { type: 'startsWith', href: paths.dashboard.warehouses },
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
      {
        type: 'item',
        key: 'profitability-report',
        title: 'Gerçek Kar/Zarar Raporu',
        href: paths.dashboard.reports.financial.profitability,
        icon: 'chart-bar',
        roles: ['ADMIN', 'ACCOUNTANT'],
        matcher: { type: 'startsWith', href: paths.dashboard.reports.financial.profitability },
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
      // Yeni eklenen Stok Durumu sayfası:
      {
        type: 'item',
        key: 'stock-status',
        title: 'Stok Durumu',
        href: paths.dashboard.stockStatus, // paths.ts'den gelen yeni yol
        icon: 'stack', // nav-icons.tsx'te mevcut bir ikon
        roles: ['ADMIN', 'WAREHOUSE_STAFF', 'SALES', 'ACCOUNTANT'],
        matcher: { type: 'startsWith', href: paths.dashboard.stockStatus },
      },
    ],
  },
  {
    type: 'group',
    key: 'reports', // Bu grup şu an için boş kalabilir veya diğer raporları buraya taşıyabiliriz.
    title: 'Raporlar',
    roles: ['ADMIN', 'ACCOUNTANT', 'SALES', 'WAREHOUSE_STAFF'],
    items: [
      // Eğer paths.ts'deki diğer raporları burada göstermek istersen, buraya ekleyebilirsin.
      // Örneğin:
      // {
      //   type: 'item',
      //   key: 'cash-flow-report',
      //   title: 'Nakit Akışı',
      //   href: paths.dashboard.reports.financial.cashFlow,
      //   icon: 'bank',
      //   roles: ['ADMIN', 'ACCOUNTANT'],
      //   matcher: { type: 'startsWith', href: paths.dashboard.reports.financial.cashFlow },
      // },
      // ... diğer raporlar
    ],
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
        type: 'group',
        key: 'settings',
        title: 'Ayarlar',
        roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF', 'ACCOUNTANT'],
        items: [
          {
            type: 'item',
            key: 'inflation-data',
            title: 'Enflasyon Verileri',
            href: paths.dashboard.settings.inflation,
            icon: 'chart-line',
            matcher: { type: 'equals', href: paths.dashboard.settings.inflation },
          },
        ],
      }
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