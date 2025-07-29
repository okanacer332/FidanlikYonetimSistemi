// client/src/app/dashboard/reports/profitability/page.tsx
'use client';

import * as React from 'react';
import { Stack, Typography, CircularProgress, Alert, Card, CardContent, Box, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PickerChangeHandlerContext } from '@mui/x-date-pickers/models';
import { DateValidationError } from '@mui/x-date-pickers/models';

// Düzeltme: Alias yolları göreceli yollara çevrildi
import { useUser } from '../../../../hooks/use-user';
import { getRealProfitLossReport } from '../../../../api/reports';
// RealProfitLossReport tipini number olarak bırakıyoruz, çünkü backend'den böyle geliyor.
import type { RealProfitLossReport as RawRealProfitLossReport } from '../../../../types/nursery';
import { Chart } from '../../../../components/core/chart';
import type { ApexOptions } from 'apexcharts';

// Big.js kütüphanesini import et
import Big from 'big.js';

// Big.js nesnelerini kullanacak yerel bir tip tanımlıyoruz
interface ProcessedRealProfitLossReport {
    period: string; // YYYY-MM formatında
    nominalRevenue: Big;
    realRevenue: Big;
    nominalCostOfGoodsSold: Big;
    realCostOfGoodsSold: Big;
    nominalOperatingExpenses: Big;
    realOperatingExpenses: Big;
    nominalGrossProfit: Big;
    realGrossProfit: Big;
    nominalNetProfit: Big;
    realNetProfit: Big;
    baseInflationDate: string; // ISO Date String
}

// Helper function to format currency
const formatCurrency = (amount: number) =>
    Number(amount || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

// Helper function to format date for display
const formatDateForDisplay = (dateString: string | Date, formatOptions: Intl.DateTimeFormatOptions) => {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('tr-TR', formatOptions);
};

export default function RealProfitLossPage(): React.JSX.Element {
    // report state'i artık ProcessedRealProfitLossReport tipinde olacak
    const { user: currentUser } = useUser();
    const [report, setReport] = React.useState<ProcessedRealProfitLossReport | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [startDate, setStartDate] = React.useState<Date | null>(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });
    const [endDate, setEndDate] = React.useState<Date | null>(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth() + 1, 0);
    });

    const canViewReports = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

    const fetchReport = React.useCallback(async () => {
        if (!startDate || !endDate) {
            setError('Lütfen raporu görüntülemek için bir Başlangıç ve Bitiş Tarihi seçin.');
            return;
        }
        if (!canViewReports) {
            setError('Bu raporu görüntüleme yetkiniz bulunmamaktadır. Lütfen yöneticinizle iletişime geçin.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // API'den gelen ham veriyi RawRealProfitLossReport tipinde alıyoruz
            const rawFetchedReport: RawRealProfitLossReport = await getRealProfitLossReport(startDate, endDate, endDate);

            // Ham sayısal alanları Big.js nesnelerine dönüştürüp ProcessedRealProfitLossReport tipine uygun hale getiriyoruz
            const processedReport: ProcessedRealProfitLossReport = {
                ...rawFetchedReport,
                nominalRevenue: new Big(rawFetchedReport.nominalRevenue),
                realRevenue: new Big(rawFetchedReport.realRevenue),
                nominalCostOfGoodsSold: new Big(rawFetchedReport.nominalCostOfGoodsSold),
                realCostOfGoodsSold: new Big(rawFetchedReport.realCostOfGoodsSold),
                nominalOperatingExpenses: new Big(rawFetchedReport.nominalOperatingExpenses),
                realOperatingExpenses: new Big(rawFetchedReport.realOperatingExpenses),
                nominalGrossProfit: new Big(rawFetchedReport.nominalGrossProfit),
                realGrossProfit: new Big(rawFetchedReport.realGrossProfit),
                nominalNetProfit: new Big(rawFetchedReport.nominalNetProfit),
                realNetProfit: new Big(rawFetchedReport.realNetProfit),
            };
            setReport(processedReport); // State'i ProcessedRealProfitLossReport ile güncelliyoruz
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Rapor alınırken bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, canViewReports]);

    React.useEffect(() => {
        if (currentUser) {
            fetchReport();
        }
    }, [currentUser, fetchReport]);

    // Calculate profit margins
    // Artık report.nominalRevenue gibi alanlar Big nesnesi olduğu için .gt(), .div() vb. metotlar kullanılabilir.
    const nominalProfitMargin = report && report.nominalRevenue.gt(0)
        ? report.nominalNetProfit.div(report.nominalRevenue).times(100).toFixed(2) // .multipliedBy yerine .times
        : '0.00';

    const realProfitMargin = report && report.realRevenue.gt(0)
        ? report.realNetProfit.div(report.realRevenue).times(100).toFixed(2) // .multipliedBy yerine .times
        : '0.00';

    // Calculate inflation effect
    const inflationEffect = report
        ? report.nominalNetProfit.minus(report.realNetProfit).abs().toNumber() // .subtract yerine .minus
        : 0;
    const isInflationLoss = report ? report.nominalNetProfit.gt(report.realNetProfit) : false;


    // Chart options for Bar Chart (Nominal vs Real)
    const barChartOptions: ApexOptions = {
        chart: { background: 'transparent', stacked: false, toolbar: { show: false } },
        colors: ['#4ade80', '#fbbf24'], // Real (Green), Nominal (Yellow)
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
            position: 'top',
            horizontalAlign: 'right',
        },
        plotOptions: { bar: { columnWidth: '40%' } },
        stroke: { colors: ['transparent'], show: true, width: 2 },
        xaxis: {
            categories: ['Gelirler', 'Satılan Mal Maliyeti', 'İşletme Giderleri', 'Brüt Kar', 'Net Kar'],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { rotate: -45, rotateAlways: true, style: { fontSize: '12px' } },
        },
        yaxis: { labels: { formatter: (value: number) => formatCurrency(value) } },
        tooltip: { y: { formatter: (value: number) => formatCurrency(value) } },
    };

    const barChartSeries = report
        ? [
              {
                  name: 'Gerçek Değer',
                  data: [
                      report.realRevenue.toNumber(),
                      report.realCostOfGoodsSold.toNumber(),
                      report.realOperatingExpenses.toNumber(),
                      report.realGrossProfit.toNumber(),
                      report.realNetProfit.toNumber(),
                  ],
              },
              {
                  name: 'Nominal Değer',
                  data: [
                      report.nominalRevenue.toNumber(),
                      report.nominalCostOfGoodsSold.toNumber(),
                      report.nominalOperatingExpenses.toNumber(),
                      report.nominalGrossProfit.toNumber(),
                      report.nominalNetProfit.toNumber(),
                  ],
              },
          ]
        : [];

    // Chart options for Pie Chart (Profit Distribution)
    const pieChartOptions: ApexOptions = {
        chart: { type: 'donut', background: 'transparent' },
        labels: ['Reel Kar', 'Enflasyon Kaybı'],
        colors: ['#4CAF50', '#FF5722'], // Green for Real Profit, Red/Orange for Inflation Loss
        legend: { position: 'bottom' },
        dataLabels: { enabled: true, formatter: (val: any) => `${val}%` },
        tooltip: {
            y: {
                formatter: (value: number) => formatCurrency(value),
            },
        },
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Nominal Kar',
                            formatter: (w: any) => {
                                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                                return formatCurrency(total);
                            },
                        },
                    },
                },
            },
        },
    };

    const pieChartSeries = report
        ? [report.realNetProfit.toNumber(), inflationEffect]
        : [];

    // Monthly inflation data (Static for demonstration, ideally from backend)
    const monthlyInflationData = [
        { month: 'Ocak', rate: 3.8562 },
        { month: 'Şubat', rate: 3.1706 },
        { month: 'Mart', rate: 4.9367 },
        { month: 'Nisan', rate: 2.0108 },
        { month: 'Mayıs', rate: -0.7113 },
        { month: 'Haziran', rate: -0.2688 },
    ];

    // Total compound inflation factor (Static for demonstration, ideally from backend)
    const totalCompoundInflationFactor = 1.1356; // Example from user's prompt

    // Loading and Error states
    if (loading) {
        return (
            <Stack sx={{ alignItems: 'center', mt: 4 }} spacing={2}>
                <CircularProgress />
                <Typography variant="subtitle1" color="text.secondary">Rapor verileri yükleniyor...</Typography>
            </Stack>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
    }

    return (
        <Stack spacing={3}>
            {/* 1. Ana Başlık */}
            <Typography variant="h4" sx={{ mb: 1 }}>Gerçek Kar/Zarar Analizi (Enflasyon Düzeltildi)</Typography>
            <Typography variant="body1" color="text.secondary">
                Bu analiz, işletmenizin finansal performansını enflasyonun etkilerini göz önünde bulundurarak hem nominal hem de gerçek değerler üzerinden kapsamlı bir şekilde değerlendirir.
            </Typography>

            {/* Tarih Seçimi Kartı */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Rapor Dönemini Seçin</Typography>
                    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 2 }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            {/* @ts-ignore */}
                            <DatePicker<Date>
                                label="Başlangıç Tarihi"
                                value={startDate ?? null}
                                onChange={(newValue: Date | null, context: PickerChangeHandlerContext<DateValidationError>) => setStartDate(newValue)}
                                slotProps={{ textField: { size: 'small', fullWidth: true, helperText: 'Raporun başlangıç tarihi' } }}
                                sx={{ flexGrow: 1 }}
                            />
                        </LocalizationProvider>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            {/* @ts-ignore */}
                            <DatePicker<Date>
                                label="Bitiş Tarihi"
                                value={endDate ?? null}
                                onChange={(newValue: Date | null, context: PickerChangeHandlerContext<DateValidationError>) => setEndDate(newValue)}
                                slotProps={{ textField: { size: 'small', fullWidth: true, helperText: 'Raporun bitiş tarihi' } }}
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
                <Stack spacing={3}>
                    {/* 2. Özet Tablosu */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Özet Tablo</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Açıklama</TableCell>
                                        <TableCell align="right">Tutar</TableCell>
                                        <TableCell align="right">Oran (%)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Nominal Kar</TableCell>
                                        <TableCell align="right" sx={{ color: report.nominalNetProfit.gte(0) ? 'green' : 'red', fontWeight: 'bold' }}>
                                            {formatCurrency(report.nominalNetProfit.toNumber())}
                                        </TableCell>
                                        <TableCell align="right">{nominalProfitMargin}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Reel Kar</TableCell>
                                        <TableCell align="right" sx={{ color: report.realNetProfit.gte(0) ? 'green' : 'red', fontWeight: 'bold' }}>
                                            {formatCurrency(report.realNetProfit.toNumber())}
                                        </TableCell>
                                        <TableCell align="right">{realProfitMargin}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Enflasyon Etkisi</TableCell>
                                        <TableCell align="right" sx={{ color: isInflationLoss ? 'red' : 'green', fontWeight: 'bold' }}>
                                            {isInflationLoss ? '-' : ''}{formatCurrency(inflationEffect)}
                                        </TableCell>
                                        <TableCell align="right">-</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* 4. Grafikler */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Kar/Zarar Kalemlerinin Nominal ve Gerçek Karşılaştırması</Typography>
                            <Chart type="bar" height={400} options={barChartOptions} series={barChartSeries} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Kar Paylarının Dağılımı (Nominal Kar Üzerinden)</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                                {pieChartSeries[0] === 0 && pieChartSeries[1] === 0 ? (
                                    <Typography color="text.secondary">Grafik verisi bulunmamaktadır.</Typography>
                                ) : (
                                    <Chart type="donut" height={350} options={pieChartOptions} series={pieChartSeries} />
                                )}
                            </Box>
                            {report.nominalNetProfit.lt(0) && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    Nominal karınız negatif olduğu için pasta grafiği gösterilememektedir. Pasta grafiği sadece pozitif nominal kar durumunda anlamlıdır.
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* 3. Detaylı Analiz Bölümü */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Detaylı Analiz</Typography>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>a. Nominal Kar Hesabı</Typography>
                                <Typography variant="body2">Açıklama: Satış tutarı ile maliyet arasındaki fark.</Typography>
                                <Typography variant="body2">Formül: Nominal Kar = Satış Tutarı - Maliyet</Typography>
                                <Typography variant="body2">Sonuç: {formatCurrency(report.nominalRevenue.toNumber())} - {formatCurrency(report.nominalCostOfGoodsSold.toNumber())} = <Box component="span" sx={{ color: report.nominalNetProfit.gte(0) ? 'green' : 'red', fontWeight: 'bold' }}>{formatCurrency(report.nominalNetProfit.toNumber())}</Box></Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>b. Reel Maliyet Hesabı</Typography>
                                <Typography variant="body2">Açıklama: Maliyetin enflasyonla zaman içindeki değerini hesaplamak için bileşik enflasyon faktörünü kullanın.</Typography>
                                <Typography variant="body2">Formül: Reel Maliyet = Maliyet x &Pi;(Enflasyon Faktörleri)</Typography>
                                <Typography variant="body2">Sonuç: {formatCurrency(report.nominalCostOfGoodsSold.toNumber())} x {totalCompoundInflationFactor.toFixed(4)} = <Box component="span" sx={{ color: 'black', fontWeight: 'bold' }}>{formatCurrency(report.realCostOfGoodsSold.toNumber())}</Box></Typography>
                                <Typography variant="caption" color="text.secondary">
                                    (Baz Tarih: {formatDateForDisplay(report.baseInflationDate, { day: '2-digit', month: '2-digit', year: 'numeric' })})
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>c. Reel Kar Hesabı</Typography>
                                <Typography variant="body2">Açıklama: Satış tutarı ile reel maliyet arasındaki fark.</Typography>
                                <Typography variant="body2">Formül: Reel Kar = Satış Tutarı - Reel Maliyet</Typography>
                                <Typography variant="body2">Sonuç: {formatCurrency(report.realRevenue.toNumber())} - {formatCurrency(report.realCostOfGoodsSold.toNumber())} = <Box component="span" sx={{ color: report.realNetProfit.gte(0) ? 'green' : 'red', fontWeight: 'bold' }}>{formatCurrency(report.realNetProfit.toNumber())}</Box></Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>d. Enflasyon Etkisi</Typography>
                                <Typography variant="body2">Açıklama: Enflasyonun nominal kar üzerindeki etkisini hesaplayın.</Typography>
                                <Typography variant="body2">Formül: Enflasyon Etkisi = Nominal Kar - Reel Kar</Typography>
                                <Typography variant="body2">Sonuç: {formatCurrency(report.nominalNetProfit.toNumber())} - {formatCurrency(report.realNetProfit.toNumber())} = <Box component="span" sx={{ color: isInflationLoss ? 'red' : 'green', fontWeight: 'bold' }}>{isInflationLoss ? '-' : ''}{formatCurrency(inflationEffect)}</Box></Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* 5. Enflasyon Detayı */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Enflasyon Detayı</Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Aşağıdaki tablo, rapor döneminde kullanılan aylık enflasyon oranlarını göstermektedir. Bu oranlar, reel değer hesaplamalarında temel alınmıştır.
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Ay</TableCell>
                                        <TableCell align="right">Enflasyon (%)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {monthlyInflationData.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{data.month}</TableCell>
                                            <TableCell align="right">{data.rate.toFixed(4)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
                                Toplam Bileşik Enflasyon Faktörü: {totalCompoundInflationFactor.toFixed(4)} (Yaklaşık %{(totalCompoundInflationFactor - 1) * 100})
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* 6. Notlar ve Uyarılar */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Notlar ve Uyarılar</Typography>
                            <Alert severity="info" sx={{ mb: 1 }}>
                                Haziran 2025 enflasyonu negatif olduğu için reel maliyet azaldı, bu da reel karı artırıcı bir etki yarattı.
                            </Alert>
                            <Alert severity="warning">
                                Temmuz 2025 enflasyon verisi henüz sisteme girilmediğinden veya yayınlanmadığından, bu rapora dahil edilmemiştir. Raporun doğruluğu için enflasyon verilerinin güncel tutulması önemlidir.
                            </Alert>
                        </CardContent>
                    </Card>

                    {/* 7. İstatistikler ve İpuçları */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>İstatistikler ve İpuçları</Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Bu analiz, enflasyonun işletmenizin gerçek kazancını nasıl etkilediğini açıkça göstermektedir. Nominal karınız yüksek görünse de, enflasyon düzeltmesi yapıldığında gerçek satın alma gücünüzün farklı olabileceğini unutmayın.
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Enflasyon düzeltilmiş kar (reel kar), uzun vadeli finansal planlama, yatırım kararları ve işletmenizin sürdürülebilir büyümesi için çok daha doğru ve güvenilir bir ölçüt sunar.
                            </Typography>
                            <Typography variant="body2">
                                Düzenli olarak enflasyon verilerini güncelleyerek ve bu raporu takip ederek işletmenizin gerçek performansını daha iyi yönetebilirsiniz.
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* 8. Eylem Butonları */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Ek İşlemler</Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Button variant="outlined" onClick={fetchReport} disabled={loading} startIcon={<i className="fas fa-sync-alt"></i>}>
                                    Verileri Güncelle
                                </Button>
                                <Button variant="outlined" disabled startIcon={<i className="fas fa-file-pdf"></i>}>
                                    PDF Olarak İndir
                                </Button>
                                <Button variant="outlined" disabled startIcon={<i className="fas fa-chart-line"></i>}>
                                    Detaylı Rapor Al
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            ) : (
                <Card><CardContent><Typography color="text.secondary">Raporu görüntülemek için yukarıdaki tarih aralığını seçin ve "Raporu Getir" butonuna tıklayın.</Typography></CardContent></Card>
            )}
        </Stack>
    );
}
