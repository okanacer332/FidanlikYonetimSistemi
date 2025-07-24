// client/src/components/dashboard/stock/stock-table.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import { getStockSummary } from '@/api/stock';
import type { StockSummary } from '@/types/nursery';
import { useSelection } from '@/hooks/use-selection';

export function StockTable(): React.JSX.Element {
  console.log('StockTable Rendered'); // Bu logu şimdilik bırakalım, sorunu çözdüğümüzde kaldırabiliriz

  const [stocks, setStocks] = React.useState<StockSummary[]>([]);
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);
  const [totalCount, setTotalCount] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // **** BURADAKİ SATIRI DEĞİŞTİRİYORUZ ****
  // stocks.map ile oluşturulan dizi referansını useMemo ile memoize ediyoruz
  const stockIds = React.useMemo(() => {
    return stocks.map((stock) => `${stock.plantIdentityId}-${stock.warehouseId}`);
  }, [stocks]); // Sadece 'stocks' değiştiğinde bu dizi yeniden hesaplansın

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection<string>(stockIds);
  // **** DEĞİŞİKLİK BİTTİ ****


  const fetchStocks = React.useCallback(async () => {
    console.log('fetchStocks called');
    setIsLoading(true);
    setError(null);
    try {
      const response = await getStockSummary();
      console.log('API Response received', response.data.length);
      setStocks(response.data);
      setTotalCount(response.data.length);
    } catch (err) {
      console.error('Stok özet verileri çekilirken hata oluştu:', err);
      setError('Stok verileri yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      console.log('fetchStocks finished');
    }
  }, []);

  React.useEffect(() => {
    console.log('useEffect triggered');
    fetchStocks();
  }, [fetchStocks]); // fetchStocks zaten useCallback içinde olduğu için bu güvenli olmalı

  const handlePageChange = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      console.log('handlePageChange', newPage);
      setPage(newPage);
    },
    []
  );

  const handleRowsPerPageChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log('handleRowsPerPageChange', event.target.value);
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  const paginatedStocks = React.useMemo(() => {
    console.log('paginatedStocks recalculated');
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return stocks.slice(start, end);
  }, [stocks, page, rowsPerPage]);

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography>Stok verileri yükleniyor...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
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
                {paginatedStocks.map((stock) => {
                  const uniqueKey = `${stock.plantIdentityId}-${stock.warehouseId}`;
                  return (
                    <TableRow hover key={uniqueKey}>
                      <TableCell>{stock.plantTypeName || 'N/A'}</TableCell>
                      <TableCell>{stock.plantVarietyName || 'N/A'}</TableCell>
                      <TableCell>{stock.rootstockName || 'N/A'}</TableCell>
                      <TableCell>{stock.plantSizeName || 'N/A'}</TableCell>
                      <TableCell>{stock.plantAgeName || 'N/A'}</TableCell>
                      <TableCell>{stock.warehouseName || 'N/A'}</TableCell>
                      <TableCell>{stock.totalQuantity}</TableCell>
                      <TableCell>{stock.status}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            component="div"
            count={totalCount}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25, { label: 'Tümü', value: -1 }]}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}