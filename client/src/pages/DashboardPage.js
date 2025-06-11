// src/pages/DashboardPage.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Button, Card, CardContent, Grid, Typography, Paper, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// İkonlar
import ForestIcon from '@mui/icons-material/Forest';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EventNoteIcon from '@mui/icons-material/EventNote';

// Stat kartını daha yetenekli hale getirelim
const StatCard = ({ title, value, icon, change, changeColor }) => (
  <Card elevation={3} sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom>{title}</Typography>
          <Typography variant="h4" component="div" fontWeight="bold">{value}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: changeColor, width: 56, height: 56 }}>{icon}</Avatar>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, color: changeColor === 'success.light' ? 'success.main' : 'error.main' }}>
        {change > 0 ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
        <Typography variant="body2" sx={{ ml: 0.5 }}>{Math.abs(change)}% (geçen haftaya göre)</Typography>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      {/* Üst Başlık ve Kullanıcı Bilgisi */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Ana Panel</Typography>
          <Typography variant="body1" color="text.secondary">Hoşgeldiniz, {user?.role?.name || 'Kullanıcı'}. İşte bugünün özeti.</Typography>
        </Box>
        <Button variant="outlined" onClick={logout}>Çıkış Yap</Button>
      </Box>
      
      {/* İstatistik Kartları */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Stoktaki Fidan" value="2,345" icon={<ForestIcon />} change={5.2} changeColor="success.light" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Bu Ayki Siparişler" value="12" icon={<ShoppingCartIcon />} change={-1.8} changeColor="error.light" />
        </Grid>
        {/* Hızlı Eylem Butonları */}
        <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Button component={RouterLink} to="/fidanlar/yeni" fullWidth variant="contained" size="large" startIcon={<AddCircleOutlineIcon />} sx={{height: '100%', py: 3}}>
                        Yeni Fidan Ekle
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button component={RouterLink} to="/siparisler/yeni" fullWidth variant="outlined" size="large" startIcon={<AddCircleOutlineIcon />} sx={{height: '100%', py: 3}}>
                        Yeni Sipariş Oluştur
                    </Button>
                </Grid>
            </Grid>
        </Grid>
      </Grid>
      
      {/* Son Hareketler ve Satış Grafiği */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} lg={8}>
            <Paper elevation={3} sx={{p: 2}}>
                <Typography variant="h6" gutterBottom>Satış Grafiği</Typography>
                <Typography variant="body2" color="text.secondary">Haftalık satış performansını gösteren bir grafik burada yer alacak.</Typography>
            </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
            <Paper elevation={3} sx={{p: 2}}>
                <Typography variant="h6" gutterBottom>Son Hareketler</Typography>
                <List>
                    <ListItem>
                        <ListItemAvatar><Avatar sx={{bgcolor: 'primary.main'}}><ForestIcon /></Avatar></ListItemAvatar>
                        <ListItemText primary="Yeni Fidan Eklendi" secondary="Bodur Elma Fidanı (150 Adet)" />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                        <ListItemAvatar><Avatar sx={{bgcolor: 'secondary.main'}}><ShoppingCartIcon /></Avatar></ListItemAvatar>
                        <ListItemText primary="Yeni Sipariş Oluşturuldu" secondary="ABC Peyzaj - ₺3,450.00" />
                    </ListItem>
                </List>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;