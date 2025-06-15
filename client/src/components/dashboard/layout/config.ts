// client/src/components/dashboard/layout/config.ts
import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Genel Bakış', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'customers', title: 'Müşteriler', href: paths.dashboard.customers, icon: 'users' },
  { key: 'integrations', title: 'Entegrasyonlar', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  { key: 'settings', title: 'Ayarlar', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Profilim', href: paths.dashboard.account, icon: 'user' },
  // 'Error' sayfasını menüden kaldırdık
  // { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
  { key: 'user-management', title: 'Kullanıcı Yönetimi', href: paths.dashboard.userManagement, icon: 'users' },
] satisfies NavItemConfig[];