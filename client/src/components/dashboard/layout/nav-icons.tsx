// Dosya Yolu: client/src/components/dashboard/layout/nav-icons.tsx
import { ChartPieIcon, GearSixIcon, PlugsConnectedIcon, UserIcon, UsersIcon, TreeEvergreen as TreeEvergreenIcon, Buildings as BuildingsIcon } from '@phosphor-icons/react/dist/ssr';

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'user': UserIcon,
  'users': UsersIcon,
  'tree-evergreen': TreeEvergreenIcon,
  'buildings': BuildingsIcon, // BU SATIRI EKLEYELİM
} as const;