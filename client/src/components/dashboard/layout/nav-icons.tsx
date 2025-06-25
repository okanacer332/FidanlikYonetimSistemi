import {
  ChartPie as ChartPieIcon,
  GearSix as GearSixIcon,
  PlugsConnected as PlugsConnectedIcon,
  User as UserIcon,
  Users as UsersIcon,
  TreeEvergreen as TreeEvergreenIcon,
  Buildings as BuildingsIcon,
  Package as PackageIcon,
  ShoppingCart as ShoppingCartIcon,
  Stack as StackIcon,           // ADD THIS
  Wrench as WrenchIcon,         // ADD THIS
  ChartLine as ChartLineIcon,   // ADD THIS
  Swap as SwapIcon,            // ADD THIS
  Receipt as ReceiptIcon, // Zaten var, kullanılabilir
  Bank as BankIcon,
  CreditCard as CreditCardIcon,
  ChartBar as ChartBarIcon,
  FileCsv as FileCsvIcon,
  Download as DownloadIcon
} from '@phosphor-icons/react/dist/ssr';

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'user': UserIcon,
  'users': UsersIcon,
  'tree-evergreen': TreeEvergreenIcon,
  'buildings': BuildingsIcon,
  'package': PackageIcon,
  'shopping-cart': ShoppingCartIcon,
  'stack': StackIcon,
  'wrench': WrenchIcon,
  'chart-line': ChartLineIcon,
  'swap': SwapIcon,
  'receipt': ReceiptIcon,
  'bank': BankIcon,
  'chart-bar': ChartBarIcon,
  'credit-card': CreditCardIcon,
  'file-csv': FileCsvIcon,
  'download': DownloadIcon,
} as const;