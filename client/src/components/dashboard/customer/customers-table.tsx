// Dosya Yolu: client/src/components/dashboard/customer/customers-table.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Card,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  PencilSimple as PencilSimpleIcon,
  Trash as TrashIcon,
} from '@phosphor-icons/react';
import type { Customer } from '@/types/nursery';

interface CustomersTableProps {
  rows?: Customer[];
  onEdit?: (customer: Customer) => void;
  onDelete?: (customerId: string) => void;
}

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

export function CustomersTable({ rows = [], onEdit, onDelete }: CustomersTableProps): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredRows = React.useMemo(() => {
    if (!searchTerm) return rows;
    const lowercasedTerm = searchTerm.toLowerCase();
    return rows.filter((row) =>
      [row.firstName, row.lastName, row.companyName, row.email, row.phone].some(
        (field) => field && field.toLowerCase().includes(lowercasedTerm)
      )
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
          placeholder="Müşterilerde ara..."
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
        <Table sx={{ minWidth: '800px' }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Adı Soyadı / Firma</TableCell>
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
                    <Typography variant="subtitle2">{`${row.firstName} ${row.lastName}`}</Typography>
                    {row.companyName && (
                       <Typography variant="body2" color="text.secondary">{row.companyName}</Typography>
                    )}
                  </TableCell>
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
                <TableCell colSpan={showActionsColumn ? 4 : 3} align="center">
                  {rows.length === 0 ? 'Henüz müşteri oluşturulmamış.' : 'Aramanızla eşleşen sonuç bulunamadı.'}
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