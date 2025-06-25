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

// =================================================================================
// BİLEŞENLER
// =================================================================================

// Rol kontrolü için yardımcı fonksiyon
function canUserAccess(item: NavItemConfig, userRoles: Set<string>): boolean {
  if (!item.roles || item.roles.length === 0) {
    return true;
  }
  return item.roles.some((role) => userRoles.has(role));
}

// Bir grubun altında aktif bir link olup olmadığını kontrol eden fonksiyon
function hasActiveChild(items: NavItemConfig[], pathname: string): boolean {
  for (const item of items) {
    if (item.type === 'item' && isNavItemActive({ ...item, pathname })) {
      return true;
    }
    if (item.type === 'group' && hasActiveChild(item.items, pathname)) {
      return true;
    }
  }
  return false;
}

// Menü elemanlarını recursive olarak oluşturan ana fonksiyon
function renderNavItems({
  items = [],
  pathname,
  userRoles,
}: {
  items?: NavItemConfig[];
  pathname: string;
  userRoles: Set<string>;
}): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], item: NavItemConfig): React.ReactNode[] => {
    if (!canUserAccess(item, userRoles)) {
      return acc;
    }

    if (item.type === 'group') {
      acc.push(
        <NavGroup key={item.key} group={item} pathname={pathname} userRoles={userRoles}>
          {renderNavItems({ items: item.items, pathname, userRoles })}
        </NavGroup>
      );
    } else if (item.type === 'item') {
      // HATA DÜZELTİLDİ: "key" prop'u spread operatöründen ayrıldı.
      const { key, ...restOfItem } = item;
      acc.push(<NavItem key={key} pathname={pathname} {...restOfItem} />);
    }

    return acc;
  }, []);

  return (
    <List component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </List>
  );
}

// Her bir menü grubunu yöneten bileşen
function NavGroup({
  group,
  pathname,
  children,
}: {
  group: Extract<NavItemConfig, { type: 'group' }>;
  pathname:string;
  userRoles: Set<string>; // Bu prop artık kullanılmıyor ama uyumluluk için bırakıldı
  children: React.ReactNode;
}): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState<boolean>(() => hasActiveChild(group.items, pathname));

  const handleToggle = React.useCallback((): void => {
    setIsOpen((prev) => !prev);
  }, []);
  
  // URL değiştiğinde, eğer aktif bir alt eleman varsa menüyü açık tut
  React.useEffect(() => {
    if (hasActiveChild(group.items, pathname)) {
      if (!isOpen) {
        setIsOpen(true);
      }
    }
  }, [pathname, group.items, isOpen]);

  return (
    <li style={{ paddingBottom: '8px' }}>
      <ListItemButton onClick={handleToggle} sx={{ borderRadius: 1, py: '6px', pl: '12px' }}>
        <ListItemText
          primary={group.title}
          primaryTypographyProps={{
            variant: 'overline',
            sx: { color: 'var(--mui-palette-neutral-500)' },
          }}
        />
        <CaretDownIcon
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
        />
      </ListItemButton>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
         <List component="ul" disablePadding sx={{ pl: '12px', pt: '8px' }}>
           {children}
         </List>
      </Collapse>
    </li>
  );
}


// Her bir menü linkini oluşturan bileşen
interface NavItemProps extends Omit<Extract<NavItemConfig, { type: 'item' }>, 'key' | 'type'> {
  pathname: string;
}

function NavItem({ disabled, external, href, icon, matcher, pathname, title }: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  return (
    <li>
      <ListItemButton
        {...(href
          ? { component: external ? 'a' : RouterLink, href, target: external ? '_blank' : undefined, rel: external ? 'noreferrer' : undefined }
          : { role: 'button' })}
        onClick={() => {
          if (href) {
            NProgress.start();
          }
        }}
        sx={{
          borderRadius: 1,
          color: 'var(--NavItem-color)',
          cursor: 'pointer',
          py: '6px',
          px: '12px',
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


// --- ANA YAN MENÜ BİLEŞENİ ---
export function SideNav(): React.JSX.Element {
  const pathname = usePathname();
  const { user } = useUser();
  const userRoles = React.useMemo(() => new Set(user?.roles?.map((role) => role.name) || []), [user]);

  return (
      <Box
        sx={{
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
          {renderNavItems({ items: navItems, pathname, userRoles })}
        </Box>
      </Box>
  );
}