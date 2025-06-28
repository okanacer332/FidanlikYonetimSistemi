'use client';

import * as React from 'react';
import {
  Box, Card, Divider, Stack, Table, TableBody, TableCell, TableHead,
  TablePagination, TableRow, Typography, Tooltip, IconButton, TextField, InputAdornment
} from '@mui/material';
import {
    PencilSimple as PencilSimpleIcon,
    Trash as TrashIcon,
    MagnifyingGlass as MagnifyingGlassIcon
} from '@phosphor-icons/react';
import dayjs from 'dayjs';

import type { ProductionBatch } from '@/types/nursery';

interface ProductionBatchesTableProps {
  rows?: ProductionBatch[];
  onEdit?: (batch: ProductionBatch) => void;
  onDelete?: (batchId: string) => void;
}

function applyPagination(rows: ProductionBatch[], page: number, rowsPerPage: number): ProductionBatch[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

export function ProductionBatchesTable({ rows = [], onEdit, onDelete }: ProductionBatchesTableProps): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredRows = React.useMemo(() => {
    if (!searchTerm) {
      return rows;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return rows.filter((row) => {
      const searchFields = [
        row.name,
        row.plantType?.name,
        row.plantVariety?.name,
        row.rootstock?.name,
        row.land?.name,
      ].filter(Boolean).join(' ').toLowerCase(); // null/undefined değerleri filtrele
      return searchFields.includes(lowercasedTerm);
    });
  }, [rows, searchTerm]);

  const paginatedRows = applyPagination(filteredRows, page, rowsPerPage);

  const handlePageChange = (_: unknown, newPage: number): void => { setPage(newPage); };
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>): void => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
  
  if (rows.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Henüz üretim partisi oluşturulmamış.</Typography>
      </Card>
    );
  }

  const showActionsColumn = onEdit || onDelete;

  return (
    <Card>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Parti adına veya fidan bilgilerine göre ara..."
          InputProps={{ startAdornment: (<InputAdornment position="start"><MagnifyingGlassIcon /></InputAdornment>),}}
          variant="outlined" size="small"
        />
      </Box>
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '1000px' }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Parti Adı</TableCell>
              <TableCell>Başlangıç Tarihi</TableCell>
              <TableCell>Başlangıç Adedi</TableCell>
              <TableCell>Mevcut Adet</TableCell>
              <TableCell>Maliyet Havuzu</TableCell>
              <TableCell>Fidan Bilgisi</TableCell>
              <TableCell>Arazi</TableCell>
              {showActionsColumn && <TableCell align="right">İşlemler</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell><Typography variant="subtitle2">{row.name}</Typography></TableCell>
                  <TableCell>{dayjs(row.birthDate).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>{row.initialPlantQuantity} adet</TableCell>
                  <TableCell>{row.currentPlantQuantity} adet</TableCell>
                  <TableCell>
                    {/* currentCostPool null veya undefined ise 0 kullan */}
                    {(row.currentCostPool ?? 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </TableCell>
                  <TableCell>
                    {`${row.plantType?.name || 'N/A'} - ${row.plantVariety?.name || 'N/A'} / ${row.rootstock?.name || 'N/A'} (${row.plantSize?.name || 'N/A'} - ${row.plantAge?.name || 'N/A'})`}
                  </TableCell>
                  <TableCell>{row.land?.name || 'N/A'}</TableCell>
                  {showActionsColumn && (
                    <TableCell align="right" sx={{p: 0}}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        {onEdit && (<Tooltip title="Düzenle"><IconButton onClick={() => onEdit(row)}><PencilSimpleIcon /></IconButton></Tooltip>)}
                        {onDelete && (<Tooltip title="Sil"><IconButton color="error" onClick={() => onDelete(row.id)}><TrashIcon /></IconButton></Tooltip>)}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={showActionsColumn ? 8 : 7} align="center">Aramanızla eşleşen sonuç bulunamadı.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={filteredRows.length}
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