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