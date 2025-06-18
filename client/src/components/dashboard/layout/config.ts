// Dosya Yolu: client/src/components/dashboard/layout/config.ts
import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Genel Bakış', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'plants', title: 'Fidan Kimlikleri', href: paths.dashboard.plants, icon: 'tree-evergreen' },
  { key: 'warehouses', title: 'Depo Yönetimi', href: paths.dashboard.warehouses, icon: 'buildings' },
  { key: 'suppliers', title: 'Tedarikçiler', href: paths.dashboard.suppliers, icon: 'users' }, // BU SATIR EKLENDİ (users ikonu geçici olabilir, daha uygun bir ikon seçilebilir)
  { key: 'customers', title: 'Müşteriler', href: paths.dashboard.customers, icon: 'users' },
  { key: 'user-management', title: 'Kullanıcı Yönetimi', href: paths.dashboard.userManagement, icon: 'users' },
  { key: 'integrations', title: 'Entegrasyonlar', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  { key: 'settings', title: 'Ayarlar', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Profilim', href: paths.dashboard.account, icon: 'user' },
] satisfies NavItemConfig[];