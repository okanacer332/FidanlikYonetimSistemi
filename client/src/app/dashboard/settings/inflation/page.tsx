'use client';

import * as React from 'react';
import { Button, Card, CardContent, CardHeader, Stack, CircularProgress, Alert } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/tr';
import dayjs, { type Dayjs } from 'dayjs';

// Standart Bileşenlerimizi ve Hook'larımızı import ediyoruz
import { PageHeader } from '@/components/common/PageHeader';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { useNotifier } from '@/hooks/useNotifier';
import { useInflationData } from '@/hooks/use-inflation';
import { fetchInflationData } from '@/api/inflation';
import type { InflationData } from '@/types/inflation';

const formatMonthYear = (dateString: string): string => {
  try {
    return dayjs(dateString).locale('tr').format('MMMM YYYY');
  } catch (e) {
    return 'Geçersiz Tarih';
  }
};

export default function InflationPage(): React.JSX.Element {
  const notify = useNotifier();

  const { data: inflationData, error, isLoading, mutate: mutateInflation } = useInflationData();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = React.useState<string>('date');

  // State'i Dayjs olarak tutuyoruz, bu en tutarlı yöntem.
  const [startDate, setStartDate] = React.useState<Dayjs | null>(dayjs().startOf('year'));
  const [endDate, setEndDate] = React.useState<Dayjs | null>(dayjs().endOf('year'));

  const [isFetching, setIsFetching] = React.useState(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  const handleFetchData = React.useCallback(async () => {
    if (!startDate || !endDate) {
      setFetchError('Lütfen başlangıç ve bitiş tarihlerini seçin.');
      return;
    }
    setIsFetching(true);
    setFetchError(null);
    try {
      await fetchInflationData(startDate.toDate(), endDate.toDate());
      notify.success('Veriler başarıyla çekildi ve güncellendi.');
      await mutateInflation();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
      setFetchError(msg);
      notify.error(msg);
    } finally {
      setIsFetching(false);
    }
  }, [startDate, endDate, mutateInflation, notify]);

  const columns: ColumnDef<InflationData>[] = React.useMemo(
    () => [
      { key: 'date', header: 'Tarih', sortable: true, render: (row) => formatMonthYear(row.date), getValue: (row) => row.date },
      { key: 'value', header: 'Değer (%)', sortable: true, render: (row) => row.value.toFixed(2), getValue: (row) => row.value },
    ],
    []
  );

  const sortedAndFilteredData = React.useMemo(() => {
    const data = inflationData || [];
    const filtered = searchTerm
      ? data.filter((item) => formatMonthYear(item.date).toLowerCase().includes(searchTerm.toLowerCase()))
      : data;

    return [...filtered].sort((a, b) => {
      const aValue = (a as any)[orderBy] || '';
      const bValue = (b as any)[orderBy] || '';
      if (order === 'asc') return String(aValue).localeCompare(String(bValue));
      return String(bValue).localeCompare(String(aValue));
    });
  }, [inflationData, searchTerm, order, orderBy]);

  const paginatedData = React.useMemo(() => {
    return sortedAndFilteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedAndFilteredData, page, rowsPerPage]);
  
  // KESİN ÇÖZÜM: onChange için ayrı bir handler fonksiyonu yazıyoruz.
  // Bu fonksiyon gelen değerin tipini kontrol eder ve güvenli bir şekilde state'i günceller.
  const handleDateChange = (setter: React.Dispatch<React.SetStateAction<Dayjs | null>>) => (newValue: unknown) => {
      if (newValue === null) {
          setter(null);
      } else if (dayjs.isDayjs(newValue)) {
          // Eğer gelen değer zaten bir Dayjs nesnesi ise, doğrudan ata.
          setter(newValue);
      } else if (newValue instanceof Date) {
          // Eğer bir Date nesnesi gelirse (beklenmedik durum), onu Dayjs'e çevir.
          setter(dayjs(newValue));
      }
      // Diğer durumları (string vs.) görmezden gelerek hataları engelle.
  };


  if (isLoading) return <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '80vh' }}><CircularProgress /></Stack>;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Stack spacing={3}>
      <PageHeader title="Enflasyon Verileri" />

      <Card>
        <CardHeader title="Veri Güncelleme" subheader="TCMB servisinden enflasyon verilerini çekin." />
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <DatePicker
                label="Başlangıç Tarihi"
                value={startDate}
                onChange={handleDateChange(setStartDate)}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="Bitiş Tarihi"
                value={endDate}
                onChange={handleDateChange(setEndDate)}
                slotProps={{ textField: { size: 'small' } }}
              />
              <Button variant="contained" onClick={handleFetchData} disabled={isFetching}>
                {isFetching ? <CircularProgress size={24} /> : 'Verileri Çek'}
              </Button>
            </Stack>
            {fetchError && <Alert severity="error" sx={{ mt: 2 }}>{fetchError}</Alert>}
          </LocalizationProvider>
        </CardContent>
      </Card>

      <ActionableTable
        columns={columns}
        rows={paginatedData}
        count={sortedAndFilteredData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        searchTerm={searchTerm}
        onSearch={(e) => { setSearchTerm(e.target.value); setPage(0); }}
        order={order}
        orderBy={orderBy}
        onSort={(property) => {
          const isAsc = orderBy === property && order === 'asc';
          setOrder(isAsc ? 'desc' : 'asc');
          setOrderBy(property);
        }}
        entity="inflation-data"
        selectionEnabled={false}
      />
    </Stack>
  );
}