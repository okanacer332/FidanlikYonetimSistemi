'use client';

import * as React from 'react';
import { Stack, Typography, CircularProgress, Alert, Tabs, Tab, Box, Card } from '@mui/material';
import { useUser } from '@/hooks/use-user';
import type { TopSellingPlantReport, CustomerSalesReport } from '@/types/nursery';

import { TopSellingPlantsChart } from '@/components/dashboard/reporting/top-selling-plants-chart';
import { CustomerSalesTable } from '@/components/dashboard/reporting/customer-sales-table';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`report-tabpanel-${index}`} aria-labelledby={`report-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: { xs: 1, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [tabValue, setTabValue] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [topPlants, setTopPlants] = React.useState<TopSellingPlantReport[]>([]);
  const [customerSales, setCustomerSales] = React.useState<CustomerSalesReport[]>([]);

  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

  React.useEffect(() => {
    const fetchData = async () => {
      if (!canView) {
        setError('Bu sayfayı görüntüleme yetkiniz yok.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum bulunamadı.');

        const [topPlantsRes, customerSalesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/top-selling-plants`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/customer-sales`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!topPlantsRes.ok || !customerSalesRes.ok) throw new Error('Rapor verileri yüklenemedi.');
        
        setTopPlants(await topPlantsRes.json());
        setCustomerSales(await customerSalesRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [canView]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Raporlar</Typography>
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="rapor sekmeleri" variant="scrollable" scrollButtons="auto">
            <Tab label="En Çok Satan Fidanlar" />
            <Tab label="Müşteri Satışları" />
          </Tabs>
        </Box>
        {loading ? (
          <Stack sx={{ p: 3, alignItems: 'center' }}><CircularProgress /></Stack>
        ) : error ? (
          <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>
        ) : (
          <>
            <CustomTabPanel value={tabValue} index={0}>
              <TopSellingPlantsChart data={topPlants} />
            </CustomTabPanel>
            <CustomTabPanel value={tabValue} index={1}>
              <CustomerSalesTable data={customerSales} />
            </CustomTabPanel>
          </>
        )}
      </Card>
    </Stack>
  );
}
