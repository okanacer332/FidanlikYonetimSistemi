'use client';

import * as React from 'react';
import { Button, Card, CardContent, CardHeader, Typography, Stack, CircularProgress, Alert, Divider } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; 
import 'dayjs/locale/tr';
import dayjs from 'dayjs';

// API servisimizdeki her iki fonksiyonu da import ediyoruz
import { fetchInflationData, getAllInflationData } from '@/api/inflation';
import type { InflationData } from '@/types/inflation';
// Yeni tablo bileşenimizi import ediyoruz
import { InflationDataTable } from '@/components/dashboard/settings/inflation-data-table';


export default function InflationSettingsPage(): React.JSX.Element {
  const [startDate, setStartDate] = React.useState<Date | null>(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = React.useState<Date | null>(new Date(new Date().getFullYear(), 11, 31));
  
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Veri listesi için yeni bir state
  const [data, setData] = React.useState<InflationData[]>([]);
  const [listLoading, setListLoading] = React.useState(true);

  // Verileri listeleyecek fonksiyon
  const listData = React.useCallback(async () => {
    try {
      setListLoading(true);
      const inflationList = await getAllInflationData();
      
      // --- YENİ EKLENEN LOG SATIRI ---
      console.log("Backend'den gelen veri:", inflationList); 
      
      setData(inflationList);
    } catch (err) {
      console.error("Listeleme hatası:", err); // Hata varsa konsolda görelim
      setError(err instanceof Error ? err.message : 'Veriler listelenirken bir hata oluştu.');
    } finally {
      setListLoading(false);
    }
  }, []);

  // Sayfa ilk yüklendiğinde verileri listele
  React.useEffect(() => {
    listData();
  }, [listData]);

  const handleFetchData = React.useCallback(async () => {
    if (!startDate || !endDate) {
      setError('Lütfen başlangıç ve bitiş tarihlerini seçin.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const message = await fetchInflationData(startDate, endDate);
      setSuccess(message);
      await listData(); // Başarıyla veri çektikten sonra listeyi yenile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, listData]);

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader title="Enflasyon Veri Yönetimi" subheader="TCMB EVDS servisinden periyodik gıda enflasyonu verilerini çekin." />
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
            <Stack spacing={3} sx={{ maxWidth: 400 }}>
              <Typography variant="subtitle1">Tarih Aralığı Seçin</Typography>
              <DatePicker
                label="Başlangıç Tarihi"
                value={startDate ? dayjs(startDate) : null}
                onChange={(newValue) => setStartDate(newValue ? newValue.toDate() : null)}
              />
              <DatePicker
                label="Bitiş Tarihi"
                value={endDate ? dayjs(endDate) : null}
                onChange={(newValue) => setEndDate(newValue ? newValue.toDate() : null)}
              />
              
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

              <Button
                variant="contained"
                color="primary"
                onClick={handleFetchData}
                disabled={loading || !startDate || !endDate}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{ mt: 2 }}
              >
                {loading ? 'Veriler Çekiliyor...' : 'Verileri Çek ve Güncelle'}
              </Button>
            </Stack>
          </LocalizationProvider>
        </CardContent>
      </Card>

      <Divider />

      <Typography variant="h6">Kaydedilmiş Enflasyon Verileri</Typography>
      {listLoading ? (
        <Stack sx={{ alignItems: 'center', mt: 3 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <InflationDataTable rows={data} />
      )}
    </Stack>
  );
};