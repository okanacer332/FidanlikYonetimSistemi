// client/src/app/dashboard/reports/profitability/page.tsx
'use client';

import * as React from 'react';
import { Stack, Typography, Grid, CircularProgress, Alert, Card, CardContent, Button, Box } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { PageHeader } from '@/components/common/PageHeader';
import { useRealProfitLoss } from '@/hooks/use-real-profit-loss';
import { StatCard } from '@/components/dashboard/overview/StatCard';
import { Money as MoneyIcon, TrendDown as TrendDownIcon, CheckCircle as CheckCircleIcon } from '@phosphor-icons/react';

const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '₺0,00';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

export default function Page(): React.JSX.Element {
  dayjs.locale('tr');

  const [startDate, setStartDate] = React.useState<Date | null>(dayjs().startOf('year').toDate());
  const [endDate, setEndDate] = React.useState<Date | null>(dayjs().endOf('month').toDate());

  const { data: reportData, error, isLoading } = useRealProfitLoss({ startDate, endDate });

  // Şelale Grafiği için verileri ve ayarları hazırlayalım
  const waterfallChartOptions: ApexCharts.ApexOptions = {
    chart: { 
        type: 'bar', // HATA 1 DÜZELTMESİ: Tipi 'bar' olarak değiştiriyoruz.
        height: 350, 
        toolbar: { show: false } 
    },
    // HATA 2 DÜZELTMESİ: 'plotOptions' objesini 'any' olarak cast ederek TypeScript'in
    // 'waterfall' özelliğini tanımasını sağlıyoruz.
    plotOptions: {
        bar: {
            horizontal: false,
        },
        waterfall: {
            enabled: true,
            // Başlangıç ve bitiş sütunları için renkler
            total: {
                enabled: true,
                formatter: (val: number) => formatCurrency(val),
                label: 'Reel Net Kâr',
                style: {
                    color: '#2e7d32', // Yeşil
                    fontWeight: 'bold'
                }
            },
            // Ara toplam sütunları için renkler
            subtotals: {
                enabled: true,
                label: 'Nominal Net Kâr',
                style: {
                    color: '#1976d2', // Mavi
                    fontWeight: 'bold'
                }
            }
        },
    } as any, // TypeScript hatasını aşmak için 'any' cast'i
    dataLabels: { 
        enabled: true, 
        formatter: (val: number) => formatCurrency(val),
        style: { colors: ['#333'], fontWeight: 500 } 
    },
    stroke: { width: 0 },
    xaxis: {
      type: 'category',
    },
    yaxis: { title: { text: 'Tutar (₺)' } },
    grid: { show: false },
  };

  const waterfallChartSeries = reportData ? [{
    data: [
      { x: 'Nominal Gelir', y: reportData.nominalRevenue, color: '#2e7d32' },
      { x: 'SMM', y: -reportData.nominalCostOfGoodsSold, color: '#d32f2f' },
      { x: 'Giderler', y: -reportData.nominalOperatingExpenses, color: '#d32f2f' },
      // ApexCharts'ta ara toplamlar (subtotal) ve toplamlar (total)
      // options içinde belirtilir, seride özel bir işaret gerekmez.
      { x: 'Nominal Net Kâr', y: reportData.nominalNetProfit }, 
      { x: 'Enflasyon Etkisi', y: -(reportData.nominalNetProfit - reportData.realNetProfit), color: '#FF9800' },
      { x: 'Reel Net Kâr', y: reportData.realNetProfit },
    ],
  }] : [];


  const inflationEffect = reportData ? reportData.nominalNetProfit - reportData.realNetProfit : 0;
  const pieChartData = reportData && reportData.nominalNetProfit > 0 ? [
    { id: 0, value: reportData.realNetProfit, label: 'Gerçek Kâr', color: '#2e7d32' },
    { id: 1, value: inflationEffect, label: 'Enflasyona Giden', color: '#d32f2f' },
  ] : [];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <Stack spacing={3}>
        <AppBreadcrumbs />
        <PageHeader title="Reel Kâr/Zarar (Zirve Raporu)" />

        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <DatePicker 
                  label="Başlangıç Tarihi" 
                  value={dayjs(startDate)} 
                  onChange={(newValue) => {
                    if (newValue === null) setStartDate(null);
                    else if (dayjs.isDayjs(newValue)) setStartDate(newValue.toDate());
                    else setStartDate(newValue as Date);
                  }}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }} 
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <DatePicker 
                  label="Bitiş Tarihi" 
                  value={dayjs(endDate)} 
                  onChange={(newValue) => {
                    if (newValue === null) setEndDate(null);
                    else if (dayjs.isDayjs(newValue)) setEndDate(newValue.toDate());
                    else setEndDate(newValue as Date);
                  }}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }} 
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Button variant="contained" fullWidth>Raporu Getir</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {isLoading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ height: '50vh' }}><CircularProgress /></Stack>
        ) : error ? (
          <Alert severity="error">Rapor verileri yüklenirken hata oluştu: {error.message}</Alert>
        ) : reportData && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <StatCard title="Nominal Net Kâr (Görünen)" value={formatCurrency(reportData.nominalNetProfit)} icon={MoneyIcon} iconColor="var(--mui-palette-info-main)" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <StatCard title="Enflasyon Etkisi (Kayıp)" value={formatCurrency(-inflationEffect)} icon={TrendDownIcon} iconColor="var(--mui-palette-error-main)" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <StatCard title="Reel Net Kâr (Gerçek Kazanç)" value={formatCurrency(reportData.realNetProfit)} icon={CheckCircleIcon} iconColor="var(--mui-palette-success-main)" />
            </Grid>
            
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Kârın Yolculuğu</Typography>
                  {/* HATA 1 DÜZELTMESİ: type='bar' olarak güncellendi */}
                  <Chart options={waterfallChartOptions} series={waterfallChartSeries} type="bar" height={350} />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" align="center">Nominal Kârın Akıbeti</Typography>
                  <Stack sx={{ height: 350 }}>
                    {pieChartData.length > 0 ? (
                      <PieChart
                        series={[{
                          data: pieChartData,
                          innerRadius: 80,
                          arcLabel: (item) => `${(item.value / reportData.nominalNetProfit * 100).toFixed(0)}%`,
                        }]}
                        sx={{ [`& .${pieArcLabelClasses.root}`]: { fill: 'white', fontWeight: 'bold' } }}
                      />
                    ) : (
                      <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                        <Typography color="text.secondary">Nominal kâr negatif olduğu için dağılım gösterilemiyor.</Typography>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Stack>
    </LocalizationProvider>
  );
}