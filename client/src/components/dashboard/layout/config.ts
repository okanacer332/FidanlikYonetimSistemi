// client/src/components/dashboard/layout/config.ts
import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Genel Bakış', href: paths.dashboard.overview, icon: 'chart-pie' },
  // --- GÜNCELLENEN SATIR ---
  { key: 'nursery-definitions', title: 'Fidanlık Tanımları', href: paths.dashboard.nurseryDefinitions.plantTypes, icon: 'tree-evergreen' },
  // -------------------------
  { key: 'customers', title: 'Müşteriler', href: paths.dashboard.customers, icon: 'users' },
  { key: 'integrations', title: 'Entegrasyonlar', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  { key: 'settings', title: 'Ayarlar', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Profilim', href: paths.dashboard.account, icon: 'user' },
  { key: 'user-management', title: 'Kullanıcı Yönetimi', href: paths.dashboard.userManagement, icon: 'users' },
] satisfies NavItemConfig[];