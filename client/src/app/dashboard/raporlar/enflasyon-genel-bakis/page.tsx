// client/src/app/dashboard/raporlar/enflasyon-genel-bakis/page.tsx
'use client';

import * as React from 'react';
import { Stack, Typography, Grid, CircularProgress, Alert, Card, CardContent, Box } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

// Ortak ve yeni oluşturduğumuz bileşenleri/hook'ları import edelim
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { PageHeader } from '@/components/common/PageHeader';
import { useInflationOverview } from '@/hooks/use-inflation-overview'; // Yeni hook'umuz

// Para formatlama yardımcısı
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

// Ana Sayfa Component'i
export default function Page(): React.JSX.Element {
  
  const { data, error, isLoading } = useInflationOverview();

  if (isLoading) {
    return (
        <Stack spacing={3}>
            <AppBreadcrumbs />
            <PageHeader title="Enflasyon Genel Bakış" />
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '60vh' }}><CircularProgress /></Stack>
        </Stack>
    );
  }

  if (error || !data) {
    return (
        <Stack spacing={3}>
            <AppBreadcrumbs />
            <PageHeader title="Enflasyon Genel Bakış" />
            <Alert severity="error">Rapor verileri yüklenirken bir hata oluştu: {error?.message || 'Veri bulunamadı.'}</Alert>
        </Stack>
    );
  }

  // Grafik için verileri hazırlayalım
  const trendData = data.monthlyInflationTrend || [];
  const xAxisData = trendData.map(item => item.monthYear);
  const seriesData = trendData.map(item => item.rate);
  
  return (
    <Stack spacing={3}>
      <AppBreadcrumbs />
      <PageHeader title="Enflasyon Genel Bakış" />
      
      <Grid container spacing={3}>
        {/* --- Yıllık Enflasyon Göstergesi (Gauge Chart) --- */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Yıllık Üretici Fiyat Endeksi (Yİ-ÜFE)</Typography>
              <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Gauge
                  width={200}
                  height={120}
                  value={data.annualProducerPriceIndex}
                  valueMax={100} // Göstergenin maksimum değeri
                  startAngle={-110}
                  endAngle={110}
                  text={`${data.annualProducerPriceIndex}%`}
                  sx={(theme) => ({
                    [`& .${gaugeClasses.valueText}`]: {
                      fontSize: 32,
                      fontWeight: 'bold',
                      transform: 'translate(0px, 0px)',
                    },
                    [`& .${gaugeClasses.valueArc}`]: {
                      fill: theme.palette.error.main,
                    },
                  })}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" align="center">
                Üretim maliyetlerinizin piyasadaki ortalama artış oranı.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* --- Paranın Değer Kaybı Kartı --- */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'warning.lightest' }}>
            <CardContent sx={{textAlign: 'center'}}>
              <Typography variant="h6" color="text.secondary">
                1 Yıl Önceki 10.000 TL'niz Bugün Değerinde
              </Typography>
              <Typography variant="h2" component="p" sx={{ color: 'error.main', fontWeight: 'bold', my: 2 }}>
                {formatCurrency(data.purchasingPowerOf10k)}
              </Typography>
              <Typography variant="body1">
                Enflasyon, paranızın alım gücünü bu şekilde etkiledi.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* --- Aylık Trend Grafiği (Line Chart) --- */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Son 12 Aylık Enflasyon Trendi</Typography>
              <Box sx={{ height: 350 }}>
                <LineChart
                  xAxis={[{ scaleType: 'band', data: xAxisData }]}
                  series={[{ data: seriesData, label: 'Aylık Yİ-ÜFE (%)', color: '#16a34a', area: true, showMark: false }]}
                  grid={{ horizontal: true }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}