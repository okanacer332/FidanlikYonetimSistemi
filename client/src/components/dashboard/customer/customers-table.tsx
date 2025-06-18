// Dosya Yolu: client/src/components/dashboard/customer/customers-table.tsx
'use client';

import * as React from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead,
  TablePagination, TableRow, Typography, Button, Divider, Stack
} from '@mui/material';

import type { Customer } from '@/types/nursery';

interface CustomersTableProps {
  count?: number;
  page?: number;
  rows?: Customer[];
  rowsPerPage?: number;
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  // DÜZELTME: Props'ları opsiyonel yaptık. Fonksiyon gönderilmezse butonlar render edilmeyecek.
  onEdit?: (customer: Customer) => void;
  onDelete?: (customerId: string) => void;
}

export function CustomersTable({
  count = 0,
  page = 0,
  rows = [],
  rowsPerPage = 0,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
}: CustomersTableProps): React.JSX.Element {

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Adı Soyadı</TableCell>
              <TableCell>Şirket Adı</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Adres</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={row.id}>
                <TableCell>
                  <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                    <Typography variant="subtitle2">{row.firstName} {row.lastName}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>{row.companyName || '-'}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {/* DÜZELTME: Buton sadece onEdit prop'u varsa gösterilecek */}
                    {onEdit && (
                      <Button variant="outlined" size="small" onClick={() => onEdit(row)}>
                        Düzenle
                      </Button>
                    )}
                    {/* DÜZELTME: Buton sadece onDelete prop'u varsa gösterilecek */}
                    {onDelete && (
                      <Button variant="outlined" size="small" color="error" onClick={() => onDelete(row.id)}>
                        Sil
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}