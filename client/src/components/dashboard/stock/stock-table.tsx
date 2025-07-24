// client/src/components/dashboard/stock/stock-table.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
// API çağrılarını güncelliyoruz
import { getStocks, getPlants, getWarehouses } from '@/api/stock';
import type { Stock, Plant, Warehouse, StockSummary } from '@/types/nursery';
import { useSelection } from '@/hooks/use-selection';

// Bu yardımcı fonksiyon, ham verileri birleştirerek tablonun beklediği formata dönüştürür
const createStockSummary = (
  stocks: Stock[],
  plants: Plant[],
  warehouses: Warehouse[]
): StockSummary[] => {
  const plantMap = new Map<string, Plant>(plants.map((p) => [p.id, p]));
  const warehouseMap = new Map<string, Warehouse>(warehouses.map((w) => [w.id, w]));

  return stocks.map((stock) => {
    const plant = plantMap.get(stock.plantId);
    const warehouse = warehouseMap.get(stock.warehouseId);

    return {
      plantIdentityId: stock.plantId,
      warehouseId: stock.warehouseId,
      plantTypeName: plant?.plantType?.name ?? 'Bilinmiyor',
      plantVarietyName: plant?.plantVariety?.name ?? 'Bilinmiyor',
      rootstockName: plant?.rootstock?.name ?? 'Bilinmiyor',
      plantSizeName: plant?.plantSize?.name ?? 'Bilinmiyor',
      plantAgeName: plant?.plantAge?.name ?? 'Bilinmiyor',
      warehouseName: warehouse?.name ?? 'Bilinmiyor',
      totalQuantity: stock.quantity,
      status: stock.quantity > 0 ? 'Stokta' : 'Tükendi',
    };
  });
};

export function StockTable(): React.JSX.Element {
  const [summaryStocks, setSummaryStocks] = React.useState<StockSummary[]>([]);
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const stockIds = React.useMemo(() => {
    return summaryStocks.map((stock) => `${stock.plantIdentityId}-${stock.warehouseId}`);
  }, [summaryStocks]);

  // useSelection hook'unu çağırıyoruz, ancak dönen değerleri kullanmıyoruz.
  // Bu hook'un bir yan etkisi yoksa ve sadece seçim mantığı içinse bu şekilde bırakılabilir.
  useSelection<string>(stockIds);

  const fetchDataAndCombine = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Promise.all ile tüm verileri aynı anda, paralel olarak çekiyoruz
      const [stocksData, plantsData, warehousesData] = await Promise.all([
        getStocks(),
        getPlants(),
        getWarehouses(),
      ]);

      // Verileri birleştirip state'i güncelliyoruz
      const combinedData = createStockSummary(stocksData, plantsData, warehousesData);
      setSummaryStocks(combinedData);

    } catch (err) {
      console.error('Veriler çekilirken veya birleştirilirken hata oluştu:', err);
      const errorMessage = err instanceof Error ? err.message : 'Stok verileri yüklenirken bir hata oluştu.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDataAndCombine();
  }, [fetchDataAndCombine]);

  const handlePageChange = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage);
    },
    []
  );

  const handleRowsPerPageChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  const paginatedStocks = React.useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return summaryStocks.slice(start, end);
  }, [summaryStocks, page, rowsPerPage]);

  if (isLoading) {
    return <Card><CardContent><Typography>Stok verileri yükleniyor...</Typography></CardContent></Card>;
  }

  if (error) {
    return <Card><CardContent><Typography color="error">{error}</Typography></CardContent></Card>;
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <div style={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Fidan Tipi</TableCell>
                  <TableCell>Fidan Çeşidi</TableCell>
                  <TableCell>Anaç</TableCell>
                  <TableCell>Boyut</TableCell>
                  <TableCell>Yaş</TableCell>
                  <TableCell>Depo</TableCell>
                  <TableCell>Toplam Miktar</TableCell>
                  <TableCell>Durum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStocks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography>Gösterilecek stok verisi bulunamadı.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStocks.map((stock) => {
                    const uniqueKey = `${stock.plantIdentityId}-${stock.warehouseId}`;
                    return (
                      <TableRow hover key={uniqueKey}>
                        <TableCell>{stock.plantTypeName}</TableCell>
                        <TableCell>{stock.plantVarietyName}</TableCell>
                        <TableCell>{stock.rootstockName}</TableCell>
                        <TableCell>{stock.plantSizeName}</TableCell>
                        <TableCell>{stock.plantAgeName}</TableCell>
                        <TableCell>{stock.warehouseName}</TableCell>
                        <TableCell>{stock.totalQuantity}</TableCell>
                        <TableCell>{stock.status}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            component="div"
            count={summaryStocks.length}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
