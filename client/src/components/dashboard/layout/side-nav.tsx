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
import Typography from '@mui/material/Typography';
import { CaretDown as CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { useUser } from '@/hooks/use-user';
import { navItems } from './config';
import { navIcons } from './nav-icons';

function hasActiveChild(items: NavItemConfig[], pathname: string): boolean {
  for (const item of items) {
    if (item.type === 'item' && isNavItemActive({ href: item.href, matcher: item.matcher, pathname })) {
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
    return true; // No roles defined, accessible to all
  }
  return item.roles.some(role => userRoles.has(role));
}

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();
  const { user } = useUser();

  const userRoles = React.useMemo(() => new Set(user?.roles?.map(role => role.name) || []), [user]);

  return (
    <Box
      sx={{
        '--SideNav-background': 'var(--mui-palette-neutral-950)',
        '--SideNav-color': 'var(--mui-palette-common-white)',
        '--NavItem-color': 'var(--mui-palette-neutral-300)',
        '--NavItem-hover-background': 'rgba(255, 255, 255, 0.04)',
        '--NavItem-active-background': 'var(--mui-palette-primary-main)',
        '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
        '--NavItem-disabled-color': 'var(--mui-palette-neutral-500)',
        '--NavItem-icon-color': 'var(--mui-palette-neutral-400)',
        '--NavItem-icon-active-color': 'var(--mui-palette-primary-contrastText)',
        '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-600)',
        bgcolor: 'var(--SideNav-background)',
        color: 'var(--SideNav-color)',
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
      <Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />
      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        <List component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {renderNavItems({ items: navItems, pathname, userRoles })}
        </List>
      </Box>
    </Box>
  );
}

function renderNavItems({ items = [], pathname, userRoles }: { items?: NavItemConfig[]; pathname: string; userRoles: Set<string> }): React.ReactNode {
  return items.reduce((acc: React.ReactNode[], item: NavItemConfig): React.ReactNode[] => {
    if (!canUserAccess(item, userRoles)) {
      return acc;
    }

    if (item.type === 'group') {
      acc.push(
        <NavGroup key={item.key} group={item} pathname={pathname}>
          {renderNavItems({ items: item.items, pathname, userRoles })}
        </NavGroup>
      );
    } 
    else if (item.type === 'item') {
      acc.push(<NavItem key={item.key} pathname={pathname} {...item} />);
    }

    return acc;
  }, []);
}

function NavGroup({ group, pathname, children }: { group: Extract<NavItemConfig, { type: 'group' }>, pathname: string, children: React.ReactNode }): React.JSX.Element {
    const [open, setOpen] = React.useState<boolean>(hasActiveChild(group.items, pathname));

    React.useEffect(() => {
        if(hasActiveChild(group.items, pathname)) {
            setOpen(true);
        }
    }, [pathname, group.items]);

    return (
        <li style={{ paddingBottom: '8px' }}>
            <ListItemButton onClick={() => setOpen(!open)} sx={{ borderRadius: 1, py: '6px' }}>
                <ListItemText 
                    primary={group.title}
                    primaryTypographyProps={{
                        variant: 'overline',
                        sx: { color: 'var(--mui-palette-neutral-400)' }
                    }}
                />
                <CaretDownIcon
                    style={{
                        transform: open ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.2s',
                    }}
                />
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="ul" disablePadding sx={{ pl: '12px', pt: '8px' }}>
                    {children}
                </List>
            </Collapse>
        </li>
    );
}

function NavItem({ disabled, external, href, icon, matcher, pathname, title }: Extract<NavItemConfig, { type: 'item' }>): React.JSX.Element {
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
            bgcolor: 'var(--NavItem-disabled-background)',
            color: 'var(--NavItem-disabled-color)',
            cursor: 'not-allowed',
          }),
          ...(active && { bgcolor: 'var(--NavItem-active-background)', color: 'var(--NavItem-active-color)' }),
        }}
      >
        {Icon && (
          <ListItemIcon sx={{minWidth: 'auto', mr: 1.5, color: 'inherit'}}>
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
            sx: { color: 'inherit' }
          }}
        />
      </ListItemButton>
    </li>
  );
}