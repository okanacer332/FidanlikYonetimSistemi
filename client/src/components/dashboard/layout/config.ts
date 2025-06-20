import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Genel Bakış', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'plants', title: 'Fidan Kimlikleri', href: paths.dashboard.plants, icon: 'tree-evergreen' },
  { key: 'warehouses', title: 'Depo Yönetimi', href: paths.dashboard.warehouses, icon: 'buildings' },
  { key: 'suppliers', title: 'Tedarikçiler', href: paths.dashboard.suppliers, icon: 'users' },
  { key: 'customers', title: 'Müşteriler', href: paths.dashboard.customers, icon: 'users' },
  // ADD THE FOLLOWING ITEM
  { key: 'goods-receipts', title: 'Mal Girişi', href: paths.dashboard.goodsReceipts, icon: 'package' },
  { key: 'user-management', title: 'Kullanıcı Yönetimi', href: paths.dashboard.userManagement, icon: 'users' },
  { key: 'settings', title: 'Ayarlar', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Profilim', href: paths.dashboard.account, icon: 'user' },
  // NOTE: I've removed the 'integrations' link as it seems to be placeholder content.
] satisfies NavItemConfig[];