'use client';

import * as React from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CardHeader,
  Divider,
  TextField,
  InputAdornment,
  TablePagination
} from '@mui/material';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react';
import type { ProfitabilityReportDto } from '@/types/nursery';

// Sayfalama fonksiyonu
function applyPagination(rows: ProfitabilityReportDto[], page: number, rowsPerPage: number): ProfitabilityReportDto[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

interface ProfitabilityTableProps {
  data: ProfitabilityReportDto[];
}

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
});

export function ProfitabilityTable({ data = [] }: ProfitabilityTableProps): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Arama filtresi
  const filteredData = React.useMemo(() => {
    if (!searchTerm) {
      return data;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return data.filter((row) =>
      row.plantName.toLowerCase().includes(lowercasedTerm)
    );
  }, [data, searchTerm]);

  const paginatedData = applyPagination(filteredData, page, rowsPerPage);

  const handlePageChange = (_: unknown, newPage: number): void => {
    setPage(newPage);
  };
  
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (data.length === 0) {
      return (
          <Card>
              <CardHeader title="Ürün Karlılık Raporu"/>
              <Divider/>
              <Typography color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
                  Raporu oluşturmak için yeterli veri bulunmamaktadır.
              </Typography>
          </Card>
      )
  }

  return (
    <Card>
      <CardHeader title="Ürün Karlılık Raporu" />
      <Divider />
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Fidan adına göre ara..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MagnifyingGlassIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          size="small"
        />
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Fidan Adı</TableCell>
              <TableCell align="right">Satılan Miktar</TableCell>
              <TableCell align="right">Toplam Hasılat</TableCell>
              <TableCell align="right">Toplam Maliyet</TableCell>
              <TableCell align="right">Toplam Kâr</TableCell>
              <TableCell align="right">Kâr Marjı</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => {
              const profitMargin = row.totalRevenue > 0 ? (row.totalProfit / row.totalRevenue) * 100 : 0;
              const profitColor = row.totalProfit >= 0 ? 'success.main' : 'error.main';

              return (
                <TableRow hover key={row.plantId}>
                  <TableCell>
                    <Typography variant="subtitle2">{row.plantName}</Typography>
                  </TableCell>
                  <TableCell align="right">{row.totalQuantitySold} adet</TableCell>
                  <TableCell align="right">{currencyFormatter.format(row.totalRevenue)}</TableCell>
                  <TableCell align="right">{currencyFormatter.format(row.totalCost)}</TableCell>
                  <TableCell align="right" sx={{ color: profitColor, fontWeight: 'bold' }}>
                    {currencyFormatter.format(row.totalProfit)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: profitColor, fontWeight: 'bold' }}>
                    {profitMargin.toFixed(2)}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={filteredData.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Sayfa başına satır:"
      />
    </Card>
  );
}