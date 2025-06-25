'use client';

import * as React from 'react';
import { Stack, Typography, CircularProgress, Alert, Button, Box } from '@mui/material';
import { Download as DownloadIcon, FileCsv as FileCsvIcon } from '@phosphor-icons/react';
import { useUser } from '@/hooks/use-user';
import type { ProfitabilityReportDto } from '@/types/nursery';
import { ProfitabilityTable } from '@/components/dashboard/reporting/profitability-table';
import { generateProfitabilityReportPdf } from '@/lib/pdf/generate-profitability-report-pdf';
import { generateProfitabilityReportCsv } from '@/lib/csv/generate-profitability-report-csv';
import { DateRangeFilter } from '@/components/dashboard/reporting/date-range-filter'; // Adım 1'de oluşturduğumuz bileşen
import dayjs from 'dayjs';

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [data, setData] = React.useState<ProfitabilityReportDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Seçilen tarih aralığını tutmak için yeni bir state ekliyoruz.
  const [dateRange, setDateRange] = React.useState<{ startDate: Date; endDate: Date } | null>(null);

  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT' || role.name === 'SALES');

  // Veri çekme mantığını useEffect içine alıyoruz.
  // Bu hook, kullanıcı bilgisi veya tarih aralığı değiştiğinde yeniden çalışacak.
  React.useEffect(() => {
    const fetchData = async () => {
      // Tarih aralığı henüz ayarlanmadıysa veri çekme.
      if (!dateRange) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum bulunamadı.');

        // Tarihleri backend'in beklediği YYYY-MM-DD formatına çeviriyoruz.
        const startDate = dayjs(dateRange.startDate).format('YYYY-MM-DD');
        const endDate = dayjs(dateRange.endDate).format('YYYY-MM-DD');
        
        // API isteğine tarih parametrelerini ekliyoruz.
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/profitability?startDate=${startDate}&endDate=${endDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            // Sunucudan gelen hata mesajını yakalamak için
            const errorText = await response.text();
            console.error("Sunucu Hatası:", errorText);
            throw new Error(`Rapor verileri yüklenemedi. Sunucu: ${response.statusText}`);
        }
        
        setData(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    if (canView && dateRange) {
        fetchData();
    }
  }, [canView, dateRange]); // dateRange değiştiğinde bu fonksiyon yeniden tetiklenir.

  // DateRangeFilter bileşeninden gelen yeni tarih aralığını state'e atayan fonksiyon.
  const handleDateChange = (newRange: { startDate: Date; endDate: Date }) => {
    setDateRange(newRange);
  };

  const handleExportPdf = () => {
    if (data.length > 0 && currentUser?.tenantId) {
      generateProfitabilityReportPdf(data, currentUser.tenantId);
    }
  };

  const handleExportCsv = () => {
    if (data.length > 0) {
      generateProfitabilityReportCsv(data);
    }
  };

  if (!canView) {
      return (
          <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>
      )
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <Typography variant="h4">Karlılık Raporu</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <DateRangeFilter onChange={handleDateChange} />
            <Button
              onClick={handleExportCsv}
              startIcon={<FileCsvIcon />}
              variant="outlined"
              disabled={loading || data.length === 0}
            >
              Excel/CSV
            </Button>
            <Button
              onClick={handleExportPdf}
              startIcon={<DownloadIcon />}
              variant="contained"
              disabled={loading || data.length === 0}
            >
              PDF
            </Button>
        </Box>
      </Stack>

      {/* Veri yüklenirken veya tarih aralığı beklenirken bir yükleme göstergesi */}
      {loading ? (
        <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <ProfitabilityTable data={data} />
      )}
    </Stack>
  );
}