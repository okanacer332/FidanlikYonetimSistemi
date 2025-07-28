// client/src/app/dashboard/reports/profitability/page.tsx
'use client';

import * as React from 'react';
import { Stack, Typography, CircularProgress, Alert, Card, CardContent, Box, Button } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PickerChangeHandlerContext } from '@mui/x-date-pickers/models';
import { DateValidationError } from '@mui/x-date-pickers/models';

import { useUser } from '@/hooks/use-user';
import { getRealProfitLossReport } from '@/api/reports';
import type { RealProfitLossReport } from '@/types/nursery';
import { Chart } from '@/components/core/chart';
import type { ApexOptions } from 'apexcharts';

export default function RealProfitLossPage(): React.JSX.Element {
    const { user: currentUser } = useUser();
    const [report, setReport] = React.useState<RealProfitLossReport | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [startDate, setStartDate] = React.useState<Date | null>(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1); // Ayın ilk günü
    });
    const [endDate, setEndDate] = React.useState<Date | null>(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ayın son günü
    });

    const canViewReports = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

    const fetchReport = React.useCallback(async () => {
        if (!startDate || !endDate) {
            setError('Lütfen başlangıç ve bitiş tarihlerini seçin.');
            return;
        }
        if (!canViewReports) {
            setError('Bu raporu görüntüleme yetkiniz yok.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const fetchedReport = await getRealProfitLossReport(startDate, endDate, endDate);
            setReport(fetchedReport);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
        } finally {
                setLoading(false);
        }
    }, [startDate, endDate, canViewReports]);

    React.useEffect(() => {
        if (currentUser) {
            fetchReport();
        }
    }, [currentUser, fetchReport]);


    if (loading) {
        return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    const formatCurrency = (amount: number) =>
        Number(amount || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

    const formatDateForDisplay = (dateString: string | Date, formatOptions: Intl.DateTimeFormatOptions) => {
        if (!dateString) return '';
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        return date.toLocaleDateString('tr-TR', formatOptions);
    };

    const chartOptions: ApexOptions = {
        chart: { background: 'transparent', stacked: true, toolbar: { show: false } },
        colors: ['#4ade80', '#fbbf24'],
        dataLabels: { enabled: false },
        fill: { opacity: 1, type: 'solid' },
        grid: {
            borderColor: 'divider',
            strokeDashArray: 2,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
        },
        legend: {
            show: true,
            position: 'top' as 'top' | 'right' | 'bottom' | 'left',
        },
        plotOptions: { bar: { columnWidth: '40px' } },
        stroke: { colors: ['transparent'], show: true, width: 2 },
        xaxis: {
            categories: ['Gelirler', 'Satılan Mal Maliyeti', 'Giderler', 'Brüt Kar', 'Net Kar'],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { rotate: -45, rotateAlways: true },
        },
        yaxis: {
            labels: {
                formatter: (value: number) => formatCurrency(value),
            },
        },
        tooltip: {
            y: {
                formatter: (value: number) => formatCurrency(value),
            },
        },
    };

    const chartSeries = report
        ? [
              {
                  name: 'Gerçek Değer',
                  data: [
                      report.realRevenue,
                      report.realCostOfGoodsSold,
                      report.realOperatingExpenses,
                      report.realGrossProfit,
                      report.realNetProfit,
                  ],
              },
              {
                  name: 'Nominal Değer',
                  data: [
                      report.nominalRevenue,
                      report.nominalCostOfGoodsSold,
                      report.nominalOperatingExpenses,
                      report.nominalGrossProfit,
                      report.nominalNetProfit,
                  ],
              },
          ]
        : [];


    return (
        <Stack spacing={3}>
            <Typography variant="h4">Gerçek Kar/Zarar Raporu</Typography>

            <Card>
                <CardContent>
                    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 2 }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            {/* @ts-ignore */}
                            <DatePicker<Date>
                                label="Başlangıç Tarihi"
                                value={startDate ?? undefined}
                                onChange={(newValue: Date | null, context: PickerChangeHandlerContext<DateValidationError>) => setStartDate(newValue)}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                sx={{ flexGrow: 1 }}
                            />
                        </LocalizationProvider>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            {/* @ts-ignore */}
                            <DatePicker<Date>
                                label="Bitiş Tarihi"
                                value={endDate ?? undefined}
                                onChange={(newValue: Date | null, context: PickerChangeHandlerContext<DateValidationError>) => setEndDate(newValue)}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                sx={{ flexGrow: 1 }}
                            />
                        </LocalizationProvider>
                    </Stack>
                    <Button variant="contained" onClick={fetchReport} disabled={loading} fullWidth>
                        {loading ? <CircularProgress size={24} /> : 'Raporu Getir'}
                    </Button>
                </CardContent>
            </Card>

            {report ? (
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Rapor Özeti ({formatDateForDisplay(report.period, { month: 'long', year: 'numeric' })})
                        </Typography>
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={2}
                            sx={{
                                justifyContent: 'space-around',
                                alignItems: { xs: 'flex-start', md: 'flex-start' },
                            }}
                        >
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1">Nominal Değerler</Typography>
                                <Box sx={{ ml: 2 }}>
                                    <Typography>Gelirler: {formatCurrency(report.nominalRevenue)}</Typography>
                                    <Typography>Satılan Mal Maliyeti: {formatCurrency(report.nominalCostOfGoodsSold)}</Typography>
                                    <Typography>İşletme Giderleri: {formatCurrency(report.nominalOperatingExpenses)}</Typography>
                                    <Typography>Brüt Kar: {formatCurrency(report.nominalGrossProfit)}</Typography>
                                    <Typography>Net Kar: {formatCurrency(report.nominalNetProfit)}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1">
                                    Gerçek Değerler (Baz Tarih: {formatDateForDisplay(report.baseInflationDate, { day: '2-digit', month: '2-digit', year: 'numeric' })})
                                </Typography>
                                <Box sx={{ ml: 2 }}>
                                    <Typography>Gelirler: {formatCurrency(report.realRevenue)}</Typography>
                                    <Typography>Satılan Mal Maliyeti: {formatCurrency(report.realCostOfGoodsSold)}</Typography>
                                    <Typography>İşletme Giderleri: {formatCurrency(report.realOperatingExpenses)}</Typography>
                                    <Typography>Brüt Kar: {formatCurrency(report.realGrossProfit)}</Typography>
                                    <Typography>Net Kar: {formatCurrency(report.realNetProfit)}</Typography>
                                </Box>
                            </Box>
                        </Stack>
                         <Box sx={{ mt: 3 }}>
                            <Chart type="bar" height={400} options={chartOptions} series={chartSeries} />
                        </Box>
                    </CardContent>
                </Card>
            ) : (
                <Card><CardContent><Typography color="text.secondary">Rapor oluşturmak için tarihleri seçip "Raporu Getir" butonuna tıklayın.</Typography></CardContent></Card>
            )}
        </Stack>
    );
}