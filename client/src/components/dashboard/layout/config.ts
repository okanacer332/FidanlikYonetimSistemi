import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems: NavItemConfig[] = [
  {
    type: 'item',
    key: 'overview',
    title: 'Anasayfa',
    href: paths.dashboard.overview,
    icon: 'chart-pie',
    roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF', 'ACCOUNTANT'], // Muhasebe rolü de anasayfayı görebilir
  },
  {
    type: 'group',
    key: 'definitions',
    title: 'Tanımlar',
    roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'],
    items: [
      { type: 'item', key: 'plants', title: 'Fidan Kimlikleri', href: paths.dashboard.plants, icon: 'tree-evergreen', roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'] },
      { type: 'item', key: 'warehouses', title: 'Depo Yönetimi', href: paths.dashboard.warehouses, icon: 'buildings', roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'] },
      { type: 'item', key: 'suppliers', title: 'Tedarikçiler', href: paths.dashboard.suppliers, icon: 'users', roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'] },
      { type: 'item', key: 'customers', title: 'Müşteriler', href: paths.dashboard.customers, icon: 'users', roles: ['ADMIN', 'SALES'] },
    ],
  },
  // --- YENİ MUHASEBE GRUBU ---
  {
    type: 'group',
    key: 'accounting',
    title: 'Muhasebe',
    roles: ['ADMIN', 'ACCOUNTANT'],
    items: [
      { type: 'item', key: 'current-accounts', title: 'Cari Hesaplar', href: paths.dashboard.accounting.currentAccounts, icon: 'swap' }, // Yeni ikon ve path eklenecek
      { type: 'item', key: 'invoices', title: 'Faturalar', href: paths.dashboard.accounting.invoices, icon: 'receipt' }, // Yeni path
      { type: 'item', key: 'payments', title: 'Kasa & Banka', href: paths.dashboard.accounting.payments, icon: 'bank' }, // Yeni ikon ve path
      { type: 'item', key: 'expenses', title: 'Gider Yönetimi', href: paths.dashboard.accounting.expenses, icon: 'credit-card' }, // Yeni ikon ve path
      { type: 'item', key: 'reports', title: 'Raporlar', href: paths.dashboard.reports, icon: 'chart-bar' },
    ],
  },
  // -------------------------
  {
    type: 'group',
    key: 'operations',
    title: 'Operasyonlar',
    roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'],
    items: [
      { type: 'item', key: 'orders', title: 'Siparişler', href: paths.dashboard.orders, icon: 'shopping-cart', roles: ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'] },
      { type: 'item', key: 'goods-receipts', title: 'Mal Girişi', href: paths.dashboard.goodsReceipts, icon: 'package', roles: ['ADMIN', 'WAREHOUSE_STAFF'] },
    ],
  },
  {
    type: 'group',
    key: 'system',
    title: 'Sistem',
    roles: ['ADMIN'],
    items: [
      { type: 'item', key: 'user-management', title: 'Kullanıcı Yönetimi', href: paths.dashboard.userManagement, icon: 'users', roles: ['ADMIN'] },
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