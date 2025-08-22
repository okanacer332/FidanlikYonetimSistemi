// client/src/app/dashboard/raporlar/maliyet-analizi/page.tsx
'use client';

import * as React from 'react';
import { Stack, Typography, Grid, CircularProgress, Alert, Card, CardContent, Autocomplete, TextField, Button } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { PageHeader } from '@/components/common/PageHeader';
import { useCostAnalysis } from '@/hooks/use-cost-analysis';
import { useApiSWR } from '@/hooks/use-api-swr';
import { useUser } from '@/hooks/use-user';
import type { ProductionBatch } from '@/types/nursery';

const useProductionBatches = (tenantId: string | undefined) => 
  useApiSWR<ProductionBatch[]>(tenantId ? '/production-batches' : null);

export default function Page(): React.JSX.Element {
  dayjs.locale('tr');
  
  const { user } = useUser();
  
  const [startDate, setStartDate] = React.useState<Date | null>(dayjs().startOf('year').toDate());
  const [endDate, setEndDate] = React.useState<Date | null>(dayjs().endOf('month').toDate());
  const [selectedBatchId, setSelectedBatchId] = React.useState<string | null>(null);

  const { data: batchesData, isLoading: isLoadingBatches } = useProductionBatches(user?.tenantId); 
  const { data: reportData, error, isLoading: isLoadingReport } = useCostAnalysis({ startDate, endDate, productionBatchId: selectedBatchId });

  const isLoading = isLoadingBatches || isLoadingReport;

  const marketTrend = reportData?.marketInflationTrend || [];
  const businessTrend = reportData?.businessCostTrend || [];
  const xAxisLabels = marketTrend.length > 0 ? marketTrend.map(p => p.label) : businessTrend.map(p => p.label);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <Stack spacing={3}>
        <AppBreadcrumbs />
        <PageHeader title="Karşılaştırmalı Maliyet Trendi" />
        
        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              {/* DÜZELTME: Grid kullanımı modern MUI standardına göre 'size' prop'u ile güncellendi. */}
              <Grid size={{ xs: 12, md: 3 }}>
                <DatePicker 
                  label="Başlangıç Tarihi" 
                  value={dayjs(startDate)} 
                  onChange={(newValue) => {
                    if (newValue === null) setStartDate(null);
                    else if (dayjs.isDayjs(newValue)) setStartDate(newValue.toDate());
                    else setStartDate(newValue);
                  }}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }} 
                />
              </Grid>
              {/* DÜZELTME: Grid kullanımı güncellendi. */}
              <Grid size={{ xs: 12, md: 3 }}>
                <DatePicker 
                  label="Bitiş Tarihi" 
                  value={dayjs(endDate)} 
                  onChange={(newValue) => {
                    if (newValue === null) setEndDate(null);
                    else if (dayjs.isDayjs(newValue)) setEndDate(newValue.toDate());
                    else setEndDate(newValue);
                  }}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }} 
                />
              </Grid>
              {/* DÜZELTME: Grid kullanımı güncellendi. */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Autocomplete
                  options={[{ id: null, batchName: 'Genel İşletme Giderleri' } as unknown as ProductionBatch, ...(batchesData || [])]}
                  getOptionLabel={(option) => option.batchName}
                  value={
                    batchesData?.find(b => b.id === selectedBatchId) || 
                    { id: null, batchName: 'Genel İşletme Giderleri' } as unknown as ProductionBatch
                  }
                  onChange={(_, newValue) => setSelectedBatchId(newValue?.id || null)}
                  renderInput={(params) => <TextField {...params} label="Analiz Kapsamı" size="small" />}
                  loading={isLoadingBatches}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </Grid>
              {/* DÜZELTME: Grid kullanımı güncellendi. */}
              <Grid size={{ xs: 12, md: 2 }}>
                <Button variant="contained" fullWidth>Yenile</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {isLoading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: 400 }}><CircularProgress /></Stack>
            ) : error ? (
              <Alert severity="error">Rapor verileri yüklenirken hata oluştu: {error.message}</Alert>
            ) : (!businessTrend.length && !marketTrend.length) ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: 400 }}>
                 <Typography color="text.secondary">Seçilen kriterler için gösterilecek veri bulunamadı.</Typography>
              </Stack>
            ) : (
              <Stack sx={{ height: 400 }}>
                <Typography variant="h6">Maliyet Endeksi (Başlangıç = 100)</Typography>
                <LineChart
                  xAxis={[{ scaleType: 'point', data: xAxisLabels }]}
                  series={[
                    { data: businessTrend.map(p => p.indexValue), label: 'Fidanlığın Maliyet Artışı', color: '#1976d2', curve: 'monotoneX', showMark: false },
                    { data: marketTrend.map(p => p.indexValue), label: 'Piyasa Enflasyonu (Yİ-ÜFE)', color: '#2e7d32', curve: 'monotoneX', showMark: false },
                  ]}
                  yAxis={[{ label: 'Endeks Değeri' }]}
                  grid={{ horizontal: true }}
                />
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </LocalizationProvider>
  );
}