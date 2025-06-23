'use client';

import * as React from 'react';
import { Box, Container, Typography, CircularProgress, Alert, Stack } from '@mui/material';
import { CreditCard as CreditCardIcon, ShoppingCart as ShoppingCartIcon, Users as UsersIcon, Tree as TreeIcon } from '@phosphor-icons/react';

import { useUser } from '@/hooks/use-user';
import type { OverviewReportDto, TopSellingPlantReport, CustomerSalesReport } from '@/types/nursery';
import { OverviewCard } from '@/components/dashboard/overview/overview-card';
import { TopSellingPlantsChart } from '@/components/dashboard/reporting/top-selling-plants-chart';
import { CustomerSalesTable } from '@/components/dashboard/reporting/customer-sales-table';

export default function Page(): React.JSX.Element {
  const { user } = useUser();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const [overviewData, setOverviewData] = React.useState<OverviewReportDto | null>(null);
  const [topPlantsData, setTopPlantsData] = React.useState<TopSellingPlantReport[]>([]);
  const [customerSalesData, setCustomerSalesData] = React.useState<CustomerSalesReport[]>([]);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum bulunamadı.');

        const [overviewRes, topPlantsRes, customerSalesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/overview`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/top-selling-plants`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/customer-sales`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!overviewRes.ok || !topPlantsRes.ok || !customerSalesRes.ok) {
          throw new Error('Anasayfa verileri yüklenirken bir hata oluştu.');
        }

        setOverviewData(await overviewRes.json());
        setTopPlantsData(await topPlantsRes.json());
        setCustomerSalesData(await customerSalesRes.json());

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <Box
      sx={{
        flexGrow: 1,
        py: 8,
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Typography variant="h4">Hoş Geldiniz, {user?.username || 'Kullanıcı'}!</Typography>
          
          {loading ? (
            <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {/* DÜZELTME: <Grid> yerine <Box> ve flexbox kullanıldı. */}
              <Box sx={{ flex: '1 1 auto', minWidth: { xs: '100%', sm: 'calc(50% - 12px)', lg: 'calc(25% - 18px)' } }}>
                <OverviewCard
                  title="Toplam Satış"
                  value={overviewData?.totalSales?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) || '₺0.00'}
                  icon={CreditCardIcon}
                  color="success.main"
                />
              </Box>
              <Box sx={{ flex: '1 1 auto', minWidth: { xs: '100%', sm: 'calc(50% - 12px)', lg: 'calc(25% - 18px)' } }}>
                <OverviewCard
                  title="Toplam Müşteri"
                  value={overviewData?.totalCustomers?.toString() || '0'}
                  icon={UsersIcon}
                  color="info.main"
                />
              </Box>
              <Box sx={{ flex: '1 1 auto', minWidth: { xs: '100%', sm: 'calc(50% - 12px)', lg: 'calc(25% - 18px)' } }}>
                <OverviewCard
                  title="Toplam Sipariş"
                  value={overviewData?.totalOrders?.toString() || '0'}
                  icon={ShoppingCartIcon}
                  color="warning.main"
                />
              </Box>
              <Box sx={{ flex: '1 1 auto', minWidth: { xs: '100%', sm: 'calc(50% - 12px)', lg: 'calc(25% - 18px)' } }}>
                <OverviewCard
                  title="Stoktaki Fidan"
                  value={overviewData?.totalPlantsInStock?.toString() || '0'}
                  icon={TreeIcon}
                  color="error.main"
                />
              </Box>
              <Box sx={{ flex: '1 1 auto', width: { xs: '100%', lg: 'calc(66.66% - 12px)' } }}>
                <TopSellingPlantsChart data={topPlantsData} />
              </Box>
              <Box sx={{ flex: '1 1 auto', width: { xs: '100%', lg: 'calc(33.33% - 12px)' } }}>
                 <CustomerSalesTable data={customerSalesData} />
              </Box>
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
