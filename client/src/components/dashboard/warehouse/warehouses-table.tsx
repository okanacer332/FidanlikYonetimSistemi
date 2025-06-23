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

import type { Warehouse } from '@/types/nursery';

interface WarehousesTableProps {
  rows?: Warehouse[];
  onEdit?: (warehouse: Warehouse) => void;
  onDelete?: (warehouseId: string) => void;
}

function applyPagination(rows: Warehouse[], page: number, rowsPerPage: number): Warehouse[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

export function WarehousesTable({ rows = [], onEdit, onDelete }: WarehousesTableProps): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredRows = React.useMemo(() => {
    if (!searchTerm) {
      return rows;
    }
    return rows.filter((row) => {
      const searchFields = [row.name, row.location].join(' ').toLowerCase();
      return searchFields.includes(searchTerm.toLowerCase());
    });
  }, [rows, searchTerm]);

  const paginatedRows = applyPagination(filteredRows, page, rowsPerPage);

  const handlePageChange = (_: unknown, newPage: number): void => { setPage(newPage); };
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>): void => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
  
  const showActionsColumn = onEdit || onDelete;

  return (
    <Card>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Depo adı veya konumuna göre ara..."
          InputProps={{ startAdornment: (<InputAdornment position="start"><MagnifyingGlassIcon /></InputAdornment>),}}
          variant="outlined" size="small"
        />
      </Box>
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Depo Adı</TableCell>
              <TableCell>Konum</TableCell>
              <TableCell>Oluşturulma Tarihi</TableCell>
              {showActionsColumn && <TableCell align="right">İşlemler</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell><Typography variant="subtitle2">{row.name}</Typography></TableCell>
                  
                  {/* DEĞİŞİKLİK: Konum bilgisi boş ise "-" göster */}
                  <TableCell>
                    {row.location ? (
                      row.location
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Belirtilmemiş
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>{dayjs(row.createdAt).format('DD/MM/YYYY HH:mm')}</TableCell>
                  
                  {showActionsColumn && (
                    <TableCell align="right" sx={{ p: 0 }}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        {onEdit && (<Tooltip title="Düzenle"><IconButton onClick={() => onEdit(row)}><PencilSimpleIcon /></IconButton></Tooltip>)}
                        {onDelete && (<Tooltip title="Sil"><IconButton color="error" onClick={() => onDelete(row.id)}><TrashIcon /></IconButton></Tooltip>)}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={showActionsColumn ? 4 : 3} align="center">
                  {rows.length === 0 ? "Henüz depo oluşturulmamış." : "Aramanızla eşleşen sonuç bulunamadı."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination component="div" count={filteredRows.length} onPageChange={handlePageChange} onRowsPerPageChange={handleRowsPerPageChange} page={page} rowsPerPage={rowsPerPage} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Sayfa başına satır:"/>
    </Card>
  );
}