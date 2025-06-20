import { ChartPieIcon, GearSixIcon, PlugsConnectedIcon, UserIcon, UsersIcon, TreeEvergreen as TreeEvergreenIcon, Buildings as BuildingsIcon, Package as PackageIcon } from '@phosphor-icons/react/dist/ssr'; // Added PackageIcon

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'user': UserIcon,
  'users': UsersIcon,
  'tree-evergreen': TreeEvergreenIcon,
  'buildings': BuildingsIcon,
  'package': PackageIcon, // ADD THIS LINE
} as const;