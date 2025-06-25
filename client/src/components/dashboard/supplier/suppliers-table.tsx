// Dosya Yolu: client/src/components/dashboard/supplier/suppliers-table.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Card,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  InputAdornment,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  PencilSimple as PencilSimpleIcon,
  Trash as TrashIcon,
} from '@phosphor-icons/react';
import type { Supplier } from '@/types/nursery';

interface SuppliersTableProps {
  rows?: Supplier[];
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (supplierId: string) => void;
}

// Sayfalama fonksiyonu
function applyPagination(rows: Supplier[], page: number, rowsPerPage: number): Supplier[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

export function SuppliersTable({ rows = [], onEdit, onDelete }: SuppliersTableProps): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Arama filtresi
  const filteredRows = React.useMemo(() => {
    if (!searchTerm) {
      return rows;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return rows.filter((row) =>
      [row.name, row.contactPerson, row.email, row.phone, row.address]
        .some(field => field && field.toLowerCase().includes(lowercasedTerm))
    );
  }, [rows, searchTerm]);

  const paginatedRows = applyPagination(filteredRows, page, rowsPerPage);

  const handlePageChange = (_: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const showActionsColumn = onEdit || onDelete;

  return (
    <Card>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tedarikçilerde ara..."
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
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        {/* 'size="small"' prop'u tabloyu daha kompakt yapar */}
        <Table sx={{ minWidth: '800px' }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tedarikçi Adı</TableCell>
              <TableCell>Yetkili Kişi</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>E-posta</TableCell>
              {showActionsColumn && <TableCell align="right">İşlemler</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{row.name}</Typography>
                  </TableCell>
                  <TableCell>{row.contactPerson}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  {showActionsColumn && (
                    <TableCell align="right" sx={{ p: 0.5 }}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        {onEdit && (
                          <Tooltip title="Düzenle">
                            <IconButton onClick={() => onEdit(row)}>
                              <PencilSimpleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Sil">
                            <IconButton color="error" onClick={() => onDelete(row.id)}>
                              <TrashIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={showActionsColumn ? 5 : 4} align="center">
                  {rows.length === 0 ? "Henüz tedarikçi oluşturulmamış." : "Aramanızla eşleşen sonuç bulunamadı."}
                </TableCell>
              </TableRow>
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
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Sayfa başına satır:"
      />
    </Card>
  );
}