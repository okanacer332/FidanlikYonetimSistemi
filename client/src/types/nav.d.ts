import type { navIcons } from '@/components/dashboard/layout/nav-icons';

// UPDATED NavItemConfig to support groups
export type NavItemConfig =
  | {
      type: 'item';
      key: string;
      title: string;
      href: string;
      icon?: keyof typeof navIcons;
      disabled?: boolean;
      external?: boolean;
      label?: string;
      matcher?: { type: 'startsWith' | 'equals'; href: string };
      roles?: string[]; // Roles that can see this item
    }
  | {
      type: 'group';
      key: string;
      title: string;
      items: NavItemConfig[];
      roles?: string[]; // Roles that can see this group
    };


    export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
}