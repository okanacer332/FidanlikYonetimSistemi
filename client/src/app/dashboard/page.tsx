'use client';

import * as React from 'react';
import { Alert, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';

// Anasayfa kart bileşenleri
import { LatestOrders } from '@/components/dashboard/overview/latest-orders';
import { Sales } from '@/components/dashboard/overview/sales';
import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';
import { OpenOrders } from '@/components/dashboard/overview/open-orders';
import { TotalStock } from '@/components/dashboard/overview/total-stock';
import { TopSellingPlants } from '@/components/dashboard/overview/top-selling-plants';
import { LowStockPlants } from '@/components/dashboard/overview/low-stock-plants';

// Backend'den gelecek veri tipleri
import type { Customer, Order, Plant } from '@/types/nursery';

// Stok verisi için tip tanımı (varsayımsal, projenizdeki tipe göre düzenlenebilir)
interface Stock {
  plantId: string;
  quantity: number;
}

// Sayfada kullanılacak dinamik veriler için bir interface
interface OverviewData {
  totalCustomers: number;
  totalProfit: number;
  openOrders: number;
  totalStock: number;
  salesByMonth: number[];
  latestOrders: {
    id: string;
    customer: { name: string };
    amount: number;
    status: 'preparing' | 'shipped' | 'delivered' | 'canceled' | 'pending' | 'refunded';
    createdAt: Date;
  }[];
  topSellingPlants: { name: string; quantity: number }[];
  lowStockPlants: { name: string; quantity: number }[];
}

export default function Page(): React.JSX.Element {
  const [data, setData] = React.useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchOverviewData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');

        // Tüm gerekli verileri Promise.all ile tek seferde çekelim
        const [ordersRes, customersRes, stockRes, plantsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/stock`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!ordersRes.ok || !customersRes.ok || !stockRes.ok || !plantsRes.ok) {
          throw new Error('Anasayfa verileri yüklenirken bir hata oluştu.');
        }

        const orders: Order[] = await ordersRes.json();
        const customers: Customer[] = await customersRes.json();
        const stocks: Stock[] = await stockRes.json();
        const plants: Plant[] = await plantsRes.json();
        
        // --- Veri İşleme ---

        // Kartlar için metrikler
        const totalCustomers = customers.length;
        const totalProfit = orders
          .filter(order => order.status === 'DELIVERED')
          .reduce((sum, order) => sum + order.totalAmount, 0);
        const openOrders = orders.filter(order => order.status === 'PREPARING' || order.status === 'SHIPPED').length;
        const totalStock = stocks.reduce((sum, stock) => sum + stock.quantity, 0);

        // Son siparişler listesi
        const customerMap = new Map(customers.map(c => [c.id, `${c.firstName} ${c.lastName}`]));
        const latestOrders = orders
          .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
          .slice(0, 6)
          .map(order => ({
            id: order.orderNumber,
            customer: { name: customerMap.get(order.customerId) || 'Bilinmeyen Müşteri' },
            amount: order.totalAmount,
            status: order.status.toLowerCase() as OverviewData['latestOrders'][number]['status'],
            createdAt: new Date(order.orderDate),
          }));

        // Aylık satış grafiği
        const salesByMonth = new Array(12).fill(0);
        const currentYear = new Date().getFullYear();
        orders.forEach(order => {
          const orderDate = new Date(order.orderDate);
          if (orderDate.getFullYear() === currentYear && order.status !== 'CANCELED') {
            const month = orderDate.getMonth();
            salesByMonth[month] += order.totalAmount;
          }
        });

        // En çok satan ve stoku azalan fidanlar
        const plantMap = new Map(plants.map(p => [p.id, `${p.plantType.name} - ${p.plantVariety.name}`]));
        const salesCount: { [key: string]: number } = {};
        orders.forEach(order => {
            if (order.status !== 'CANCELED') {
                order.items.forEach(item => {
                    const plantName = plantMap.get(item.plantId) || 'Bilinmeyen Fidan';
                    salesCount[plantName] = (salesCount[plantName] || 0) + item.quantity;
                });
            }
        });
        
        const topSellingPlants = Object.entries(salesCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, quantity]) => ({ name, quantity }));

        const lowStockPlants = stocks
            .filter(s => s.quantity > 0 && s.quantity <= 10) // Örneğin stoğu 10'dan az olanlar
            .sort((a, b) => a.quantity - b.quantity)
            .slice(0, 5)
            .map(stock => ({
                name: plantMap.get(stock.plantId) || 'Bilinmeyen Fidan',
                quantity: stock.quantity
            }));
        
        setData({
          totalCustomers,
          totalProfit,
          openOrders,
          totalStock,
          latestOrders,
          salesByMonth,
          topSellingPlants,
          lowStockPlants
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  if (isLoading) {
    return (
      <Stack sx={{ alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const formattedProfit = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(
    data?.totalProfit || 0
  );

  return (
    <Grid container spacing={3}>
      <Grid size={{ lg: 3, sm: 6, xs: 12 }}>
        <TotalProfit sx={{ height: '100%' }} value={formattedProfit} />
      </Grid>
      <Grid size={{ lg: 3, sm: 6, xs: 12 }}>
        <TotalCustomers trend="up" diff={5} sx={{ height: '100%' }} value={data?.totalCustomers.toString() ?? '0'} />
      </Grid>
      <Grid size={{ lg: 3, sm: 6, xs: 12 }}>
        <OpenOrders sx={{ height: '100%' }} value={data?.openOrders.toString() ?? '0'} />
      </Grid>
      <Grid size={{ lg: 3, sm: 6, xs: 12 }}>
        <TotalStock sx={{ height: '100%' }} value={data?.totalStock.toString() ?? '0'} />
      </Grid>

      <Grid size={{ lg: 8, xs: 12 }}>
        <Sales
          chartSeries={[
            { name: 'Bu Yıl (₺)', data: data?.salesByMonth || [] },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid size={{ lg: 4, md: 6, xs: 12 }}>
        <TopSellingPlants plants={data?.topSellingPlants} sx={{ height: '100%' }} />
      </Grid>

      <Grid size={{ lg: 8, md: 12, xs: 12 }}>
        <LatestOrders orders={data?.latestOrders} sx={{ height: '100%' }} />
      </Grid>
       <Grid size={{ lg: 4, md: 6, xs: 12 }}>
        <LowStockPlants plants={data?.lowStockPlants} sx={{ height: '100%' }} />
      </Grid>
    </Grid>
  );
}
