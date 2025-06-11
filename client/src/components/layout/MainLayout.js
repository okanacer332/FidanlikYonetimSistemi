// src/components/layout/MainLayout.js
import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline } from '@mui/material';

// İkonlar
import DashboardIcon from '@mui/icons-material/Dashboard';
import ForestIcon from '@mui/icons-material/Forest';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const menuItems = [
  { text: 'Ana Panel', icon: <DashboardIcon />, path: '/' },
  { text: 'Fidanlar', icon: <ForestIcon />, path: '/fidanlar' },
  { text: 'Müşteriler', icon: <PeopleIcon />, path: '/musteriler' },
  { text: 'Siparişler', icon: <ShoppingCartIcon />, path: '/siparisler' },
  { text: 'Kullanıcılar', icon: <AccountCircleIcon />, path: '/kullanicilar' },
];

const MainLayout = () => {
  const { user } = useAuth();
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Fidanlık Yönetimi - Hoşgeldin, {user?.email}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar /> 
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding component={RouterLink} to={item.path} sx={{ color: 'inherit', textDecoration: 'none' }}>
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
      >
        <Toolbar /> 
        {/* Tıkladığımız sayfanın içeriği burada gösterilecek */}
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default MainLayout;