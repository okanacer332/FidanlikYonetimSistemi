'use client';

import * as React from 'react';
import { Stack, Typography, CircularProgress, Alert, Button, Box } from '@mui/material';
import { Download as DownloadIcon, FileCsv as FileCsvIcon } from '@phosphor-icons/react';
import { useUser } from '@/hooks/use-user';
import type { ProfitabilityReportDto } from '@/types/nursery';
import { ProfitabilityTable } from '@/components/dashboard/reporting/profitability-table';
import { generateProfitabilityReportPdf } from '@/lib/pdf/generate-profitability-report-pdf';
import { generateProfitabilityReportCsv } from '@/lib/csv/generate-profitability-report-csv'; // CSV fonksiyonunu import et

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [data, setData] = React.useState<ProfitabilityReportDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/profitability`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Rapor verileri yüklenemedi.');
        }
        
        setData(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
        fetchData();
    }
  }, [canView, currentUser]);

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

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <Typography variant="h4">Karlılık Raporu</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
              onClick={handleExportCsv}
              startIcon={<FileCsvIcon />}
              variant="outlined"
              disabled={loading || data.length === 0}
          >
              Excel/CSV Aktar
          </Button>
          <Button
            onClick={handleExportPdf}
            startIcon={<DownloadIcon />}
            variant="contained"
            disabled={loading || data.length === 0}
          >
            PDF Aktar
          </Button>
        </Box>
      </Stack>

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