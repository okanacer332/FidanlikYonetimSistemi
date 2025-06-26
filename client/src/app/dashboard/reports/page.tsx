'use client';

import * as React from 'react';
import { Box, CircularProgress, Grid, Stack, Typography, Alert } from '@mui/material';
import { CreditCard as CreditCardIcon, ChartLine as ChartLineIcon, UserPlus as UserPlusIcon, ShoppingCart as ShoppingCartIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';

import { useUser } from '@/hooks/use-user';
import { DateRangeFilter } from '@/components/dashboard/reporting/date-range-filter';
import { OverviewCard } from '@/components/dashboard/overview/overview-card'; // Bu bileşeni kullanacağız.
import { TopSellingPlantsChart } from '@/components/dashboard/reporting/top-selling-plants-chart';
import { CustomerSalesTable } from '@/components/dashboard/reporting/customer-sales-table';
import { Sales } from '@/components/dashboard/overview/sales'; // Aylık trendler için bu grafiği uyarlayabiliriz.

// Backend'den gelecek verilerin tipleri (varsayımsal, backend'e göre güncellenmeli)
interface DashboardData {
  overview: {
    totalSales: number;
    netProfit: number;
    totalOrders: number;
    newCustomers: number;
  };
  topPlants: any[];
  customerSales: any[];
  monthlySales: { name: string; data: number[] }[];
}

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Varsayılan olarak bu ayı gösterecek şekilde ayarlandı.
  const [dateRange, setDateRange] = React.useState<{ startDate: Date; endDate: Date }>({
    startDate: dayjs().startOf('month').toDate(),
    endDate: dayjs().endOf('month').toDate(),
  });
  
  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT' || role.name === 'SALES');

  const handleDateChange = (newRange: { startDate: Date; endDate: Date }) => {
    setDateRange(newRange);
  };
  
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      if (!canView || !dateRange) return;
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Oturum bulunamadı.');
        setLoading(false);
        return;
      }
      
      const startDate = dayjs(dateRange.startDate).format('YYYY-MM-DD');
      const endDate = dayjs(dateRange.endDate).format('YYYY-MM-DD');

      try {
        // Tüm rapor verilerini tek bir yerden çekmek yerine, paralel olarak çekelim.
        const [overviewRes, topPlantsRes, customerSalesRes /*, monthlySalesRes */] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/dashboard-overview?startDate=${startDate}&endDate=${endDate}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/top-selling-plants?startDate=${startDate}&endDate=${endDate}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/customer-sales?startDate=${startDate}&endDate=${endDate}`, { headers: { Authorization: `Bearer ${token}` } }),
          // fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/monthly-sales?startDate=${startDate}&endDate=${endDate}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!overviewRes.ok || !topPlantsRes.ok || !customerSalesRes.ok) {
          throw new Error('Rapor verileri yüklenemedi.');
        }

        setData({
          overview: await overviewRes.json(),
          topPlants: await topPlantsRes.json(),
          customerSales: await customerSalesRes.json(),
          monthlySales: [{ name: 'Bu Yıl', data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] }] // Bu veri şimdilik statik
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [canView, dateRange]);

  if (!canView) {
    return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Genel Bakış Raporu</Typography>
        <DateRangeFilter onChange={handleDateChange} />
      </Stack>

      {loading ? (
        <Stack sx={{ alignItems: 'center', mt: 5 }}><CircularProgress /></Stack>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : data ? (
        <Grid container spacing={3}>
          {/* KPI Kartları */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}><OverviewCard title="Toplam Satış" value={data.overview.totalSales.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} icon={CreditCardIcon} color="var(--mui-palette-success-main)" /></Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}><OverviewCard title="Net Kâr" value={data.overview.netProfit.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} icon={ChartLineIcon} color="var(--mui-palette-primary-main)" /></Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}><OverviewCard title="Yeni Sipariş" value={data.overview.totalOrders.toString()} icon={ShoppingCartIcon} color="var(--mui-palette-warning-main)" /></Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}><OverviewCard title="Yeni Müşteri" value={data.overview.newCustomers.toString()} icon={UserPlusIcon} color="var(--mui-palette-info-main)" /></Grid>

          {/* Grafikler */}
          <Grid size={{ lg: 8, xs: 12 }}>
            <Sales chartSeries={data.monthlySales} />
          </Grid>
          <Grid size={{ lg: 4, xs: 12 }}>
            <TopSellingPlantsChart data={data.topPlants} />
          </Grid>

          {/* Detay Tablosu */}
          <Grid size={{ xs: 12 }}>
            <CustomerSalesTable data={data.customerSales} />
          </Grid>
        </Grid>
      ) : (
         <Alert severity="info">Seçilen tarih aralığı için gösterilecek veri bulunamadı.</Alert>
      )}
    </Stack>
  );
}