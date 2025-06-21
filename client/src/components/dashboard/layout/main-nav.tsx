'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';

import { usePopover } from '@/hooks/use-popover';
import { useUser } from '@/hooks/use-user';
import { paths } from '@/paths';
import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';
import { NotificationsPopover, type Notification } from './notifications-popover';
import type { Order, Plant, Stock } from '@/types/nursery';

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const userPopover = usePopover<HTMLDivElement>();
  const notificationsPopover = usePopover<HTMLButtonElement>();
  const router = useRouter();
  const { user } = useUser();

  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  
  React.useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('authToken');
      if (!token || !user) return;

      try {
        // İlgili API istekleri
        const [ordersRes, stockRes, plantsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/stock`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const newNotifications: Notification[] = [];

        // Yeni Siparişler
        if (ordersRes.ok) {
          const orders: Order[] = await ordersRes.json();
          const newOrders = orders.filter(o => o.status === 'PREPARING');
          newOrders.forEach(o => {
            newNotifications.push({ id: `order-${o.id}`, type: 'new_order', message: `#${o.orderNumber} numaralı yeni bir sipariş alındı.` });
          });
        }
        
        // Stoku Azalanlar
        if (stockRes.ok && plantsRes.ok) {
            const stocks: Stock[] = await stockRes.json();
            const plants: Plant[] = await plantsRes.json();
            const plantMap = new Map(plants.map(p => [p.id, `${p.plantType.name} - ${p.plantVariety.name}`]));

            const lowStockItems = stocks.filter(s => s.quantity > 0 && s.quantity <= 10);
            lowStockItems.forEach(s => {
                const plantName = plantMap.get(s.plantId) || 'Bilinmeyen Fidan';
                newNotifications.push({ id: `stock-${s.plantId}`, type: 'low_stock', message: `${plantName} için stok kritik seviyede: ${s.quantity} adet kaldı.` });
            });
        }

        setNotifications(newNotifications);

      } catch (error) {
        console.error("Bildirimler alınırken hata oluştu:", error);
      }
    };

    fetchNotifications();
  }, [user]); // user geldiğinde de tetiklenmesi için

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton onClick={(): void => { setOpenNav(true); }} sx={{ display: { lg: 'none' } }}>
              <ListIcon />
            </IconButton>
            <Tooltip title="Ara">
              <IconButton>
                <MagnifyingGlassIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <Tooltip title="Müşteriler">
              <IconButton onClick={() => router.push(paths.dashboard.customers)}>
                <UsersIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Bildirimler">
              <IconButton ref={notificationsPopover.anchorRef} onClick={notificationsPopover.handleOpen}>
                <Badge badgeContent={notifications.length} color="error">
                  <BellIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            {/* --- DÜZELTİLMİŞ AVATAR KISMI --- */}
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              sx={{ cursor: 'pointer' }}
              // src="/assets/avatar.png" prop'u kaldırıldı
            >
              {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
            </Avatar>
            {/* --- DÜZELTME SONU --- */}
          </Stack>
        </Stack>
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      {/* Yeni eklediğimiz NotificationsPopover bileşeni */}
      <NotificationsPopover anchorEl={notificationsPopover.anchorRef.current} onClose={notificationsPopover.handleClose} open={notificationsPopover.open} notifications={notifications} />
      <MobileNav onClose={() => { setOpenNav(false); }} open={openNav} />
    </React.Fragment>
  );
}