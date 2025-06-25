'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import NProgress from 'nprogress';
import { CaretDown as CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { useUser } from '@/hooks/use-user';
import { navItems } from './config';
import { navIcons } from './nav-icons';

// --- ADIM 1: MENÜNÜN BEYNİNİ (CONTEXT) OLUŞTURMA ---
interface NavContextType {
  openTopGroup: string | undefined;
  openNestedGroups: Set<string>;
  handleTopGroupToggle: (key: string) => void;
  handleNestedGroupToggle: (key: string) => void;
  pathname: string;
  userRoles: Set<string>;
}

const NavContext = React.createContext<NavContextType | undefined>(undefined);

// Context'i kullanmayı kolaylaştıran bir hook
function useNav(): NavContextType {
  const context = React.useContext(NavContext);
  if (!context) {
    throw new Error('useNav must be used within a NavProvider.');
  }
  return context;
}

// Tüm state mantığını içinde barındıran ana Provider bileşeni
function NavProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const pathname = usePathname();
  const { user } = useUser();
  const userRoles = React.useMemo(() => new Set(user?.roles?.map((role) => role.name) || []), [user]);

  const [openTopGroup, setOpenTopGroup] = React.useState<string | undefined>();
  const [openNestedGroups, setOpenNestedGroups] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    // Aktif sayfanın üst gruplarını bulma fonksiyonu
    function getActiveGroups(items: NavItemConfig[]): { top?: string; nested: Set<string> } {
      const nested = new Set<string>();
      let top: string | undefined;

      function find(subItems: NavItemConfig[], parentKey?: string): boolean {
        for (const item of subItems) {
          if (item.type === 'group') {
            if (find(item.items, item.key)) {
              if (parentKey) nested.add(parentKey);
              else top = item.key;
              return true;
            }
          } else if (item.type === 'item' && isNavItemActive({ ...item, pathname })) {
            if (parentKey) nested.add(parentKey);
            return true;
          }
        }
        return false;
      }
      find(navItems);
      return { top, nested };
    }

    const active = getActiveGroups(navItems);
    setOpenTopGroup(active.top);
    setOpenNestedGroups(active.nested);
  }, [pathname]);

  const handleTopGroupToggle = React.useCallback((key: string) => {
    setOpenTopGroup((prev) => (prev === key ? undefined : key));
  }, []);

  const handleNestedGroupToggle = React.useCallback((key: string) => {
    setOpenNestedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  }, []);

  const value = React.useMemo(
    () => ({
      openTopGroup,
      openNestedGroups,
      handleTopGroupToggle,
      handleNestedGroupToggle,
      pathname,
      userRoles,
    }),
    [openTopGroup, openNestedGroups, handleTopGroupToggle, handleNestedGroupToggle, pathname, userRoles]
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

// --- ADIM 2: ANA SIDENAV BİLEŞENİNİ TEMİZLEME ---
// SideNav artık sadece görsel çerçeveyi ve Provider'ı içeriyor.
export function SideNav(): React.JSX.Element {
  return (
    <NavProvider>
      <Box
        sx={{
          // Stil tanımlarınızın tamamı korundu.
          '--SideNav-background': '#fdfae5',
          '--SideNav-color': 'var(--mui-palette-neutral-900)',
          '--NavItem-color': 'var(--mui-palette-neutral-600)',
          '--NavItem-hover-background': 'rgba(0, 0, 0, 0.04)',
          '--NavItem-active-background': 'var(--mui-palette-primary-main)',
          '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
          '--NavItem-disabled-color': 'var(--mui-palette-neutral-400)',
          '--NavItem-icon-color': 'var(--mui-palette-neutral-500)',
          '--NavItem-icon-active-color': 'var(--mui-palette-primary-contrastText)',
          '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-400)',
          bgcolor: 'var(--SideNav-background)',
          color: 'var(--SideNav-color)',
          borderRight: '1px solid var(--mui-palette-neutral-200)',
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          height: '100%',
          left: 0,
          maxWidth: '100%',
          position: 'fixed',
          scrollbarWidth: 'none',
          top: 0,
          width: 'var(--SideNav-width)',
          zIndex: 'var(--SideNav-zIndex)',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <Stack spacing={2} sx={{ p: 3, alignItems: 'center' }}>
          <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-flex' }}>
            <Box
              component="img"
              alt="FidanFYS Logo"
              src="/assets/acrtech-fidanfys-logo.png"
              sx={{ height: '100px', width: 'auto' }}
            />
          </Box>
        </Stack>
        <Divider sx={{ borderColor: 'var(--mui-palette-neutral-200)' }} />
        <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
          <NavItems />
        </Box>
      </Box>
    </NavProvider>
  );
}

// Menü elemanlarını listeleyen ana bileşen
function NavItems(): React.JSX.Element {
    const { userRoles } = useNav();
  
    return (
      <List component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {navItems.map((item) => {
            if (!canUserAccess(item, userRoles)) {
                return null;
            }
            return <RenderNavItem key={item.key} item={item} depth={0} />;
        })}
      </List>
    );
}

// Gelen elemanın tipine göre NavGroup veya NavItem'ı render eder
function RenderNavItem({ item, depth }: { item: NavItemConfig; depth: number }): React.JSX.Element | null {
    if (item.type === 'group') {
      return <NavGroup item={item} depth={depth} />;
    }
    
    if (item.type === 'item') {
      return <NavItem item={item} depth={depth} />;
    }

    return null;
}

// GRUP BİLEŞENİ: Artık kendi state'i yok, her şeyi Context'ten alıyor.
function NavGroup({ item, depth }: { item: Extract<NavItemConfig, { type: 'group' }>; depth: number }): React.JSX.Element {
    const { openTopGroup, openNestedGroups, handleTopGroupToggle, handleNestedGroupToggle, userRoles } = useNav();
    
    const isTopLevel = depth === 0;
    const isOpen = isTopLevel ? openTopGroup === item.key : openNestedGroups.has(item.key);
    const onToggle = isTopLevel ? () => handleTopGroupToggle(item.key) : () => handleNestedGroupToggle(item.key);
  
    return (
      <li style={{ paddingBottom: '8px' }}>
        <ListItemButton onClick={onToggle} sx={{ borderRadius: 1, py: '6px', pl: isTopLevel ? '12px' : `${12 + depth * 12}px` }}>
          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              variant: isTopLevel ? 'overline' : 'subtitle2',
              sx: { color: isTopLevel ? 'var(--mui-palette-neutral-500)' : 'var(--NavItem-color)' },
            }}
          />
          <CaretDownIcon style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
        </ListItemButton>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List component="ul" disablePadding sx={{ pt: '8px', pl: isTopLevel ? '0px' : '12px' }}>
            {item.items.map((child) => {
                if (!canUserAccess(child, userRoles)) {
                    return null;
                }
                return <RenderNavItem key={child.key} item={child} depth={depth + 1} />;
            })}
          </List>
        </Collapse>
      </li>
    );
}
  
// LİNK BİLEŞENİ: Stil ve yapı tamamen korundu.
function NavItem({ item, depth }: { item: Extract<NavItemConfig, { type: 'item' }>; depth: number }): React.JSX.Element {
    const { pathname } = useNav();
    const { disabled, external, href, icon, matcher, title } = item;
    const active = isNavItemActive({ disabled, external, href, matcher, pathname });
    const Icon = icon ? navIcons[icon] : null;
    const paddingLeft = 12 + (depth * 16);

    return (
      <li>
        <ListItemButton
          {...(href
            ? { component: external ? 'a' : RouterLink, href, target: external ? '_blank' : undefined, rel: external ? 'noreferrer' : undefined }
            : { role: 'button' })}
          onClick={() => { if (href) { NProgress.start(); } }}
          sx={{
            borderRadius: 1,
            color: 'var(--NavItem-color)',
            cursor: 'pointer',
            py: '6px',
            px: '12px',
            pl: `${paddingLeft}px`,
            transition: 'background-color 0.1s, color 0.1s',
            '&:hover': { bgcolor: 'var(--NavItem-hover-background)' },
            ...(disabled && { bgcolor: 'transparent', color: 'var(--NavItem-disabled-color)', cursor: 'not-allowed' }),
            ...(active && { bgcolor: 'var(--NavItem-active-background)', color: 'var(--NavItem-active-color)' }),
          }}
        >
          {Icon && (
            <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
              <Icon
                fill={active ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'}
                fontSize="var(--icon-fontSize-md)"
                weight={active ? 'fill' : 'regular'}
              />
            </ListItemIcon>
          )}
          <ListItemText
            primary={title}
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500, lineHeight: '28px', variant: 'body1', sx: { color: 'inherit' } }}
          />
        </ListItemButton>
      </li>
    );
}

// Rol kontrolü için yardımcı fonksiyon
function canUserAccess(item: NavItemConfig, userRoles: Set<string>): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    return item.roles.some((role) => userRoles.has(role));
}