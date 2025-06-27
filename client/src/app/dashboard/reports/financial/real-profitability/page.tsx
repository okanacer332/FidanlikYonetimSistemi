'use client';

import * as React from 'react';
import { Stack, Typography, CircularProgress, Alert, Button, Box } from '@mui/material';
import { Download as DownloadIcon } from '@phosphor-icons/react';
import { useUser } from '@/hooks/use-user';
import dayjs from 'dayjs';

// Yeni oluşturulan tipler ve bileşenler
import type { RealProfitabilityReportDto } from '@/types/nursery';
import { RealProfitabilityTable } from '@/components/dashboard/reporting/real-profitability-table';
import { DateRangeFilter } from '@/components/dashboard/reporting/date-range-filter';
// Henüz oluşturulmadı, bir sonraki adımda eklenecek
// import { generateRealProfitabilityReportPdf } from '@/lib/pdf/generate-real-profitability-report-pdf';

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [data, setData] = React.useState<RealProfitabilityReportDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [dateRange, setDateRange] = React.useState<{ startDate: Date; endDate: Date } | null>(null);

  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

  const handleDateChange = (newRange: { startDate: Date; endDate: Date }) => {
    setDateRange(newRange);
  };

  const fetchData = async () => {
    if (!dateRange) {
      setError('Lütfen bir tarih aralığı seçin.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı.');

      const startDate = dayjs(dateRange.startDate).format('YYYY-MM-DD');
      const endDate = dayjs(dateRange.endDate).format('YYYY-MM-DD');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/real-profitability?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Rapor verileri yüklenemedi: ${errorText || response.statusText}`);
      }
      
      setData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!canView) {
      return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <Typography variant="h4">Reel Kârlılık Raporu</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <DateRangeFilter onChange={handleDateChange} />
            <Button
              onClick={fetchData}
              variant="contained"
              disabled={loading || !dateRange}
            >
              Raporu Getir
            </Button>
            {/* <Button
              onClick={() => { if(data.length > 0) generateRealProfitabilityReportPdf(data) }}
              startIcon={<DownloadIcon />}
              variant="outlined"
              disabled={loading || data.length === 0}
            >
              PDF
            </Button> */}
        </Box>
      </Stack>

      {loading ? (
        <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : (
        <RealProfitabilityTable data={data} />
      )}
    </Stack>
  );
}