'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { CaretDown as CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { useUser } from '@/hooks/use-user';
import { navItems } from './config';
import { navIcons } from './nav-icons';

export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
}

function getActiveGroup(items: NavItemConfig[], pathname: string): string | undefined {
  for (const item of items) {
    if (item.type === 'group') {
      if (hasActiveChild(item.items, pathname)) {
        return item.key;
      }
    }
  }
  return undefined;
}

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

function canUserAccess(item: NavItemConfig, userRoles: Set<string>): boolean {
  if (!item.roles || item.roles.length === 0) {
    return true;
  }
  return item.roles.some((role) => userRoles.has(role));
}

export function MobileNav({ open, onClose }: MobileNavProps): React.JSX.Element {
  const pathname = usePathname();
  const { user } = useUser();
  const userRoles = React.useMemo(() => new Set(user?.roles?.map((role) => role.name) || []), [user]);

  const [openGroup, setOpenGroup] = React.useState<string | undefined>(() => getActiveGroup(navItems, pathname));

  React.useEffect(() => {
    setOpenGroup(getActiveGroup(navItems, pathname));
  }, [pathname]);

  const handleGroupToggle = React.useCallback((groupKey: string) => {
    setOpenGroup((prevOpenGroup) => (prevOpenGroup === groupKey ? undefined : groupKey));
  }, []);

  return (
    <Drawer
      PaperProps={{
        sx: {
          // --- RENK DEĞİŞİKLİKLERİ BURADA ---
          '--MobileNav-background': '#fdfae5', // Saman kağıdı / Kırık beyaz rengi
          '--MobileNav-color': 'var(--mui-palette-neutral-900)', // Arka plan açık olduğu için yazı rengi koyu
          '--NavItem-color': 'var(--mui-palette-neutral-600)',
          '--NavItem-hover-background': 'rgba(0, 0, 0, 0.04)',
          '--NavItem-active-background': 'var(--mui-palette-primary-main)',
          '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
          '--NavItem-disabled-color': 'var(--mui-palette-neutral-400)',
          '--NavItem-icon-color': 'var(--mui-palette-neutral-500)',
          '--NavItem-icon-active-color': 'var(--mui-palette-primary-contrastText)',
          '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-400)',
          bgcolor: 'var(--MobileNav-background)',
          color: 'var(--MobileNav-color)',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100%',
          scrollbarWidth: 'none',
          width: 'var(--MobileNav-width)',
          zIndex: 'var(--MobileNav-zIndex)',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      }}
      onClose={onClose}
      open={open}
    >
      <Stack spacing={2} sx={{ p: 3, alignItems: 'center' }}>
        <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-flex' }}>
          <Box
              component="img"
              alt="FidanFYS Logo"
              src="/assets/acrtech-fidanfys-logo.png"
              sx={{ height: '80px', width: 'auto' }}
            />
        </Box>
      </Stack>
      <Divider sx={{ borderColor: 'var(--mui-palette-neutral-200)' }} />
      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        <List component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {renderNavItems({
            items: navItems,
            pathname,
            userRoles,
            openGroup,
            handleGroupToggle,
            onClose,
          })}
        </List>
      </Box>
    </Drawer>
  );
}

function renderNavItems({
  items = [],
  pathname,
  userRoles,
  openGroup,
  handleGroupToggle,
  onClose,
}: {
  items?: NavItemConfig[];
  pathname: string;
  userRoles: Set<string>;
  openGroup?: string;
  handleGroupToggle: (key: string) => void;
  onClose?: () => void;
}): React.ReactNode {
  return items.reduce((acc: React.ReactNode[], item: NavItemConfig): React.ReactNode[] => {
    if (!canUserAccess(item, userRoles)) {
      return acc;
    }

    if (item.type === 'group') {
      acc.push(
        <NavGroup
          key={item.key}
          group={item}
          isOpen={openGroup === item.key}
          onToggle={() => handleGroupToggle(item.key)}
        >
          {renderNavItems({ items: item.items, pathname, userRoles, openGroup, handleGroupToggle, onClose })}
        </NavGroup>
      );
    } else if (item.type === 'item') {
      const { key, ...restOfItem } = item;
      acc.push(<NavItem key={key} pathname={pathname} {...restOfItem} onClose={onClose} />);
    }

    return acc;
  }, []);
}

function NavGroup({
  group,
  isOpen,
  onToggle,
  children,
}: {
  group: Extract<NavItemConfig, { type: 'group' }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <li style={{ paddingBottom: '8px' }}>
      <ListItemButton onClick={onToggle} sx={{ borderRadius: 1, py: '6px' }}>
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

interface NavItemProps extends Omit<Extract<NavItemConfig, { type: 'item' }>, 'key'> {
  pathname: string;
  onClose?: () => void;
}

function NavItem({ disabled, external, href, icon, matcher, pathname, title, onClose }: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  return (
    <li>
      <ListItemButton
        {...(href
          ? {
              component: external ? 'a' : RouterLink,
              href,
              target: external ? '_blank' : undefined,
              rel: external ? 'noreferrer' : undefined,
            }
          : { role: 'button' })}
        onClick={onClose}
        sx={{
          borderRadius: 1,
          color: 'var(--NavItem-color)',
          cursor: 'pointer',
          py: '6px',
          px: '12px',
          transition: 'background-color 0.1s, color 0.1s',
          '&:hover': {
            bgcolor: 'var(--NavItem-hover-background)',
          },
          ...(disabled && {
            bgcolor: 'transparent',
            color: 'var(--NavItem-disabled-color)',
            cursor: 'not-allowed',
          }),
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
          primaryTypographyProps={{
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: '28px',
            variant: 'body1',
            sx: { color: 'inherit' },
          }}
        />
      </ListItemButton>
    </li>
  );
}