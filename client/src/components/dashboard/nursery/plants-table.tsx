'use client';

import * as React from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow,
  Stack, Chip, Typography, TablePagination, Divider, Tooltip, IconButton,
  TextField, InputAdornment
} from '@mui/material';
import { 
    PencilSimple as PencilSimpleIcon,
    Trash as TrashIcon,
    MagnifyingGlass as MagnifyingGlassIcon
} from '@phosphor-icons/react';

import type { Plant } from '@/types/nursery';

interface PlantsTableProps {
  rows?: Plant[];
  onEdit?: (plant: Plant) => void;
  onDelete?: (plantId: string) => void;
}

function applyPagination(rows: Plant[], page: number, rowsPerPage: number): Plant[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

export function PlantsTable({ rows = [], onEdit, onDelete }: PlantsTableProps): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredRows = React.useMemo(() => {
    if (!searchTerm) {
      return rows;
    }
    return rows.filter((row) => {
      const searchFields = [
        row.plantType?.name, row.plantVariety?.name, row.rootstock?.name,
        row.plantSize?.name, row.plantAge?.name, row.land?.name,
      ].join(' ').toLowerCase();
      return searchFields.includes(searchTerm.toLowerCase());
    });
  }, [rows, searchTerm]);

  const paginatedRows = applyPagination(filteredRows, page, rowsPerPage);

  const handlePageChange = (_: unknown, newPage: number): void => { setPage(newPage); };
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>): void => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
  
  if (rows.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Henüz fidan kimliği oluşturulmamış.</Typography>
      </Card>
    );
  }

  const showActionsColumn = onEdit || onDelete;

  return (
    <Card>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Fidan tablosunda ara..."
          InputProps={{ startAdornment: (<InputAdornment position="start"><MagnifyingGlassIcon /></InputAdornment>),}}
          variant="outlined" size="small"
        />
      </Box>
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fidan Türü</TableCell>
              <TableCell>Fidan Çeşidi</TableCell>
              <TableCell>Anaç</TableCell>
              <TableCell>Boy</TableCell>
              <TableCell>Yaş</TableCell>
              <TableCell>Arazi</TableCell>
              {showActionsColumn && <TableCell align="right">İşlemler</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell>{row.plantType?.name || 'N/A'}</TableCell>
                  <TableCell>{row.plantVariety?.name || 'N/A'}</TableCell>
                  <TableCell>{row.rootstock?.name || 'N/A'}</TableCell>
                  <TableCell><Chip label={row.plantSize?.name || 'N/A'} size="small" variant="outlined" /></TableCell>
                  <TableCell><Chip label={row.plantAge?.name || 'N/A'} size="small" variant="outlined" /></TableCell>
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
              <TableRow><TableCell colSpan={showActionsColumn ? 7 : 6} align="center">Aramanızla eşleşen sonuç bulunamadı.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination component="div" count={filteredRows.length} onPageChange={handlePageChange} onRowsPerPageChange={handleRowsPerPageChange} page={page} rowsPerPage={rowsPerPage} rowsPerPageOptions={[5, 10, 25, 50]} labelRowsPerPage="Sayfa başına satır:"/>
    </Card>
  );
}