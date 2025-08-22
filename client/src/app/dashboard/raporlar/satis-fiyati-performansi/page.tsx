// client/src/app/dashboard/raporlar/satis-fiyati-performansi/page.tsx
'use client';

import * as React from 'react';
import { Stack, Typography, Grid, CircularProgress, Alert, Card, CardContent, Autocomplete, TextField, Button, Box } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { PageHeader } from '@/components/common/PageHeader';
import { usePricePerformance } from '@/hooks/use-price-performance';
import { useApiSWR } from '@/hooks/use-api-swr';
import { useUser } from '@/hooks/use-user';
import type { Plant } from '@/types/nursery';

const usePlants = (tenantId: string | undefined) => 
  useApiSWR<Plant[]>(tenantId ? '/plants' : null);

const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

export default function Page(): React.JSX.Element {
  dayjs.locale('tr');
  
  const { user } = useUser();
  
  const [startDate, setStartDate] = React.useState<Date | null>(dayjs().startOf('year').toDate());
  const [endDate, setEndDate] = React.useState<Date | null>(dayjs().endOf('year').toDate());
  const [selectedPlantId, setSelectedPlantId] = React.useState<string | null>(null);

  const { data: plantsData, isLoading: isLoadingPlants } = usePlants(user?.tenantId);
  const { data: reportData, error, isLoading: isLoadingReport } = usePricePerformance({ startDate, endDate, plantId: selectedPlantId });

  const isLoading = isLoadingPlants || isLoadingReport;

  const priceTrend = reportData?.priceTrend || [];
  const xAxisLabels = priceTrend.map(p => p.label);

  const getPlantLabel = (plant: Plant) => 
    `${plant.plantType.name} - ${plant.plantVariety.name} / ${plant.rootstock.name}`;
  
  const analysisResult = React.useMemo(() => {
      if (!priceTrend || priceTrend.length === 0) return null;
      const lastDataPoint = priceTrend[priceTrend.length - 1];
      if (lastDataPoint.shouldBePrice === 0) return null; // Sıfıra bölme hatasını engelle
      const diff = lastDataPoint.nominalPrice - lastDataPoint.shouldBePrice;
      const diffPercent = (diff / lastDataPoint.shouldBePrice) * 100;

      if (diff > 0) {
          return { text: `Fiyatlar enflasyonun %${diffPercent.toFixed(1)} üzerinde.`, color: 'success' as const };
      } else {
          return { text: `Fiyatlar enflasyonun %${Math.abs(diffPercent).toFixed(1)} altında kalmış.`, color: 'error' as const };
      }
  }, [priceTrend]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <Stack spacing={3}>
        <AppBreadcrumbs />
        <PageHeader title="Satış Fiyatı Performansı" />
        
        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <DatePicker 
                  label="Başlangıç Tarihi" 
                  value={dayjs(startDate)} 
                  // --- HATA 1 DÜZELTMESİ ---
                  onChange={(newValue) => {
                    if (newValue === null) setStartDate(null);
                    else if (dayjs.isDayjs(newValue)) setStartDate(newValue.toDate());
                    else setStartDate(newValue as Date); // Gelen değerin Date olduğunu varsayıyoruz
                  }}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }} 
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <DatePicker 
                  label="Bitiş Tarihi" 
                  value={dayjs(endDate)} 
                  // --- HATA 1 DÜZELTMESİ ---
                  onChange={(newValue) => {
                    if (newValue === null) setEndDate(null);
                    else if (dayjs.isDayjs(newValue)) setEndDate(newValue.toDate());
                    else setEndDate(newValue as Date);
                  }}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }} 
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  options={plantsData || []}
                  getOptionLabel={getPlantLabel}
                  onChange={(_, newValue) => setSelectedPlantId(newValue?.id || null)}
                  renderInput={(params) => <TextField {...params} label="Analiz Edilecek Fidan" size="small" />}
                  loading={isLoadingPlants}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {isLoadingReport ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: 450 }}><CircularProgress /></Stack>
            ) : error ? (
              <Alert severity="error">Rapor verileri yüklenirken hata oluştu: {error.message}</Alert>
            ) : !selectedPlantId ? (
                <Stack alignItems="center" justifyContent="center" sx={{ height: 450 }}>
                    <Typography color="text.secondary">Lütfen analiz etmek için bir fidan seçin.</Typography>
                </Stack>
            ) : priceTrend.length === 0 ? (
                <Stack alignItems="center" justifyContent="center" sx={{ height: 450 }}>
                    <Typography color="text.secondary">Seçilen fidan için belirtilen tarih aralığında satış verisi bulunamadı.</Typography>
                </Stack>
            ) : (
              <Stack spacing={2}>
                <Box sx={{ height: 400 }}>
                  <BarChart
                    xAxis={[{ scaleType: 'band', data: xAxisLabels, label: 'Dönem' }]}
                    // --- HATA 2 DÜZELTMESİ ---
                    yAxis={[{ label: 'Fiyat (₺)', valueFormatter: (value: number) => `₺${value.toLocaleString('tr-TR')}` }]}
                    series={[
                      { data: priceTrend.map(p => p.nominalPrice), label: 'Ortalama Satış Fiyatı (Nominal)', color: '#1976d2' },
                      { data: priceTrend.map(p => p.shouldBePrice), label: 'Olması Gereken Fiyat (Reel)', color: '#2e7d32' },
                    ]}
                  />
                </Box>
                {analysisResult && (
                    <Alert severity={analysisResult.color}>
                        <Typography fontWeight="bold">Analiz Sonucu:</Typography>
                        {analysisResult.text}
                    </Alert>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </LocalizationProvider>
  );
}