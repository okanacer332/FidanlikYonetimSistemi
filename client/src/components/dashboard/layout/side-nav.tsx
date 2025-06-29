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

function canUserAccess(item: NavItemConfig, userRoles: Set<string>): boolean {
  if (!item.roles || item.roles.length === 0) {
    return true;
  }
  return item.roles.some((role) => userRoles.has(role));
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

function renderNavItems({
  items = [],
  pathname,
  userRoles,
  activeTopGroup,
  handleTopGroupToggle,
  isTopLevel = false,
}: {
  items?: NavItemConfig[];
  pathname: string;
  userRoles: Set<string>;
  activeTopGroup?: string;
  handleTopGroupToggle?: (key: string) => void;
  isTopLevel?: boolean;
}): React.ReactNode {
  const children = items.reduce((acc: React.ReactNode[], item: NavItemConfig): React.ReactNode[] => {
    if (!canUserAccess(item, userRoles)) {
      return acc;
    }

    if (item.type === 'group') {
      acc.push(
        <NavGroup
          key={item.key}
          group={item}
          pathname={pathname}
          userRoles={userRoles}
          isTopLevel={isTopLevel}
          activeTopGroup={activeTopGroup}
          handleTopGroupToggle={handleTopGroupToggle}
        >
          {renderNavItems({
            items: item.items,
            pathname,
            userRoles,
            activeTopGroup,
            handleTopGroupToggle,
            isTopLevel: false,
          })}
        </NavGroup>
      );
    } else if (item.type === 'item') {
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

function NavGroup({
  group,
  pathname,
  children,
  isTopLevel,
  activeTopGroup,
  handleTopGroupToggle,
}: {
  group: Extract<NavItemConfig, { type: 'group' }>;
  pathname: string;
  userRoles: Set<string>;
  children: React.ReactNode;
  isTopLevel: boolean;
  activeTopGroup?: string;
  handleTopGroupToggle?: (key: string) => void;
}): React.JSX.Element {
  // isTopLevel ise merkezi state'i, değilse kendi local state'ini yönetir.
  const [isLocalOpen, setIsLocalOpen] = React.useState<boolean>(() => hasActiveChild(group.items, pathname));

  const handleTopLevelClick = React.useCallback((): void => {
    if (handleTopGroupToggle) {
      handleTopGroupToggle(group.key);
    }
  }, [handleTopGroupToggle, group.key]);

  const handleLocalToggle = React.useCallback((): void => {
    setIsLocalOpen((prev) => !prev);
  }, []);

  // useEffect'i güncelledik: artık manuel açma/kapama ile çakışmayacak
  React.useEffect(() => {
    if (hasActiveChild(group.items, pathname)) {
      if (!isLocalOpen) {
        setIsLocalOpen(true);
      }
    }
    // else if kısmı kaldırıldı, böylece manuel açılan alt menüler otomatik kapanmaz.
    // Alt seviye bir menü, sadece ebeveyni kapanırsa kapanmalı.
  }, [pathname, group.items]); // isLocalOpen'ı bağımlılıklardan kaldırdık

  const currentIsOpen = isTopLevel ? activeTopGroup === group.key : isLocalOpen;
  const currentHandleToggle = isTopLevel ? handleTopLevelClick : handleLocalToggle;
  
  return (
    <li style={{ paddingBottom: '8px' }}>
      <ListItemButton 
        onClick={currentHandleToggle} 
        sx={{ borderRadius: 1, py: '6px', pl: '12px' }}
      >
        <ListItemText
          primary={group.title}
          primaryTypographyProps={{
            variant: 'overline',
            sx: { color: 'var(--mui-palette-neutral-500)' },
          }}
        />
        <CaretDownIcon
          style={{
            transform: currentIsOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
        />
      </ListItemButton>
      <Collapse in={currentIsOpen} timeout="auto" unmountOnExit>
         <List component="ul" disablePadding sx={{ pl: '12px', pt: '8px', listStyle: 'none' }}>
           {children}
         </List>
      </Collapse>
    </li>
  );
}

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
          primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500, lineHeight: '28px', variant: 'body1', sx: { color: 'inherit' } }}
        />
      </ListItemButton>
    </li>
  );
}

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();
  const { user } = useUser();
  const userRoles = React.useMemo(() => new Set(user?.roles?.map((role) => role.name) || []), [user]);

  const [activeTopGroup, setActiveTopGroup] = React.useState<string | undefined>(() => getActiveTopGroupInitial(navItems, pathname));

  const handleTopGroupToggle = React.useCallback((groupKey: string) => {
    setActiveTopGroup((prevActiveTopGroup) => (prevActiveTopGroup === groupKey ? undefined : groupKey));
  }, []);

  React.useEffect(() => {
    const newlyActiveTopGroup = getActiveTopGroupInitial(navItems, pathname);
    setActiveTopGroup(newlyActiveTopGroup);
  }, [pathname]);

  function getActiveTopGroupInitial(items: NavItemConfig[], currentPathname: string): string | undefined {
    for (const item of items) {
      if (item.type === 'group') {
        if (hasActiveChild(item.items, currentPathname)) {
          return item.key;
        }
      }
    }
    return undefined;
  }

  return (
      <Box
        sx={{
          '--SideNav-background': '#fdfae5',
          '--SideNav-color': 'var(--mui-palette-neutral-900)',
          '--NavItem-color': 'var(--mui-palette-neutral-600)',
          '--NavItem-hover-background': 'rgba(0, 0, 0, 0.04)',
          '--NavItem-active-background': 'var(--mui-palette-primary-main)',
          '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
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
        <Box
  component="nav"
  sx={{
    flex: '1 1 auto',
    p: '12px',
    overflowY: 'auto', // Gerektiğinde dikey scrollbar çıkar
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(0, 0, 0, 0.05)',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: 'rgba(0, 0, 0, 0.3)',
    },
  }}
>
  {renderNavItems({
    items: navItems,
    pathname,
    userRoles,
    isTopLevel: true,
    activeTopGroup: activeTopGroup,
    handleTopGroupToggle: handleTopGroupToggle,
  })}
</Box>
      </Box>
  );
}