import type { navIcons } from '@/components/dashboard/layout/nav-icons'; // navIcons'ı import et

export interface NavItemConfig {
  key: string;
  title?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  icon?: keyof typeof navIcons; // <--- TİP BURADA GÜNCELLENDİ
  href?: string;
  items?: NavItemConfig[];
  // Matcher cannot be a function in order
  // to be able to use it on the server.
  // If you need to match multiple paths,
  // can extend it to accept multiple matchers.
  matcher?: { type: 'startsWith' | 'equals'; href: string };
}