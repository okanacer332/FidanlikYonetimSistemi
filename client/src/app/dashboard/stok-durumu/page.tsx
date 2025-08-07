// Konum: src/app/dashboard/stok-durumu/page.tsx
'use client';

import * as React from 'react';
import { Stack, CircularProgress, Alert } from '@mui/material';

// Ortak Bileşenler ve Hook'lar
import { PageHeader } from '@/components/common/PageHeader';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { StatusChip } from '@/components/common/StatusChip';
import { useUser } from '@/hooks/use-user';
import { useApiSWR } from '@/hooks/use-api-swr';

// Tipler
import type { Stock, Plant, Warehouse } from '@/types/nursery';

// Veri çekmek için SWR hook'ları
const useStocks = () => useApiSWR<Stock[]>('/stock');
const usePlants = () => useApiSWR<Plant[]>('/plants');
const useWarehouses = () => useApiSWR<Warehouse[]>('/warehouses');

// Tabloda kullanılacak satırın tipini tanımlıyoruz (ActionableTable'ın 'id' beklentisi dahil)
interface StockTableRow {
  id: string; // <-- ActionableTable için zorunlu
  plantId: string;
  warehouseId: string;
  quantity: number;
  plantTypeName: string;
  plantVarietyName: string;
  rootstockName: string;
  warehouseName: string;
  status: string;
}

export default function Page(): React.JSX.Element {
  // 1. Gerekli Hook'ları ve Verileri Çekme
  const { user: currentUser } = useUser();
  const { data: stocksData, error: stocksError, isLoading: isLoadingStocks } = useStocks();
  const { data: plantsData, error: plantsError, isLoading: isLoadingPlants } = usePlants();
  const { data: warehousesData, error: warehousesError, isLoading: isLoadingWarehouses } = useWarehouses();

  const isLoading = isLoadingStocks || isLoadingPlants || isLoadingWarehouses;
  const error = stocksError || plantsError || warehousesError;

  // 2. Tablo için State'ler
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = React.useState<string>('plantTypeName');

  // Yetki Kontrolü
  const canView = currentUser?.roles?.some(role =>
    ['ADMIN', 'SALES', 'WAREHOUSE_STAFF', 'ACCOUNTANT'].includes(role.name)
  );

  // 3. Sıralama Fonksiyonu
  const handleRequestSort = React.useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  // 4. Arama, Veri Birleştirme ve Sıralama
  const sortedAndFilteredStocks = React.useMemo((): StockTableRow[] => {
    if (!stocksData || !plantsData || !warehousesData) {
      return [];
    }
    
    // Verileri daha hızlı birleştirmek için Map'ler oluşturuyoruz.
    const plantMap = new Map<string, Plant>(plantsData.map(p => [p.id, p]));
    const warehouseMap = new Map<string, Warehouse>(warehousesData.map(w => [w.id, w])); // <-- DÜZELTME: Objenin tamamını sakla

    // Ham veriyi, tabloya uygun, zenginleştirilmiş veriye dönüştürüyoruz.
    const enrichedData: StockTableRow[] = stocksData.map(stock => {
        const plant = plantMap.get(stock.plantId);
        const warehouse = warehouseMap.get(stock.warehouseId);
        
        return {
            id: stock.id, // Backend'den gelen stok kaydının kendi ID'sini kullanıyoruz.
            plantId: stock.plantId,
            warehouseId: stock.warehouseId,
            quantity: stock.quantity,
            plantTypeName: plant?.plantType?.name ?? 'Bilinmiyor',
            plantVarietyName: plant?.plantVariety?.name ?? 'Bilinmiyor',
            rootstockName: plant?.rootstock?.name ?? 'Bilinmiyor',
            warehouseName: warehouse?.name ?? 'Bilinmeyen Depo', // <-- DÜZELTME: Objenin 'name' alanını al
            status: stock.quantity > 0 ? (stock.quantity <= 10 ? 'preparing' : 'completed') : 'canceled',
        };
    });

    // Arama filtresi
    const filtered = searchTerm
      ? enrichedData.filter(s =>
          s.plantTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.plantVarietyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.rootstockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) // Artık bu alan kesinlikle string
        )
      : enrichedData;

    // Sıralama
    return [...filtered].sort((a, b) => {
      const aValue = (a as any)[orderBy] ?? '';
      const bValue = (b as any)[orderBy] ?? '';
      if (order === 'asc') {
        return String(aValue).localeCompare(String(bValue), 'tr');
      }
      return String(bValue).localeCompare(String(aValue), 'tr');
    });
  }, [stocksData, plantsData, warehousesData, searchTerm, order, orderBy]);

  // 5. Sayfalama
  const paginatedStocks = React.useMemo(() => {
    return sortedAndFilteredStocks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedAndFilteredStocks, page, rowsPerPage]);

  // 6. Sütun Tanımları
  const columns: ColumnDef<StockTableRow>[] = React.useMemo(() => [
    { key: 'plantTypeName', header: 'Fidan Tipi', sortable: true, render: (row) => row.plantTypeName, getValue: (row) => row.plantTypeName },
    { key: 'plantVarietyName', header: 'Fidan Çeşidi', sortable: true, render: (row) => row.plantVarietyName, getValue: (row) => row.plantVarietyName },
    { key: 'rootstockName', header: 'Anaç', sortable: true, render: (row) => row.rootstockName, getValue: (row) => row.rootstockName },
    { key: 'warehouseName', header: 'Depo', sortable: true, render: (row) => row.warehouseName, getValue: (row) => row.warehouseName },
    { key: 'quantity', header: 'Miktar', sortable: true, render: (row) => row.quantity, getValue: (row) => row.quantity },
    { key: 'status', header: 'Durum', sortable: false, render: (row) => <StatusChip status={row.status} /> },
  ], []);
  
  // 7. Render Logic
  if (isLoading) return <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '80vh' }}><CircularProgress /></Stack>;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!canView) return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;

  return (
    <Stack spacing={3}>
      <AppBreadcrumbs />
      <PageHeader title="Stok Durumu" />
      
      <ActionableTable
        columns={columns}
        rows={paginatedStocks}
        count={sortedAndFilteredStocks.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); }}
        searchTerm={searchTerm}
        onSearch={(e) => { setSearchTerm(e.target.value); setPage(0); }}
        selectionEnabled={false}
        order={order}
        orderBy={orderBy}
        onSort={handleRequestSort}
        entity="stock"
      />
    </Stack>
  );
}