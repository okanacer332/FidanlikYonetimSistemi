// client/src/components/dashboard/customer/customers-table.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Button,
  Divider,
  Stack,
} from '@mui/material';

// Import ettiğiniz tiplerin doğru olduğundan emin olun
import type { Customer } from '@/types/nursery';
// useSelection şu an customers-table içinde kullanılmadığı için yorum satırı olarak bırakıldı veya kaldırılabilir.
// import { useSelection } from '@/hooks/use-selection'; 

function noop(): void {
  // do nothing
}

interface CustomersTableProps {
  count?: number;
  page?: number;
  rows?: Customer[];
  rowsPerPage?: number;
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
}

export function CustomersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onPageChange = noop,
  onRowsPerPageChange = noop,
  onEdit,
  onDelete,
}: CustomersTableProps): React.JSX.Element {
  // useSelection şu an customers-table içinde kullanılmadığı için yorum satırı olarak bırakıldı veya kaldırılabilir.
  // const rowIds = React.useMemo(() => {
  //   return rows.map((customer) => customer.id);
  // }, [rows]);
  // const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);
  // const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  // const selectedAll = rows.length > 0 && selected?.size === rows.length;

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
                    {/* Avatar alanı kaldırıldı */}
                    <Typography variant="subtitle2">{row.firstName} {row.lastName}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>{row.companyName || '-'}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button variant="outlined" size="small" onClick={() => onEdit(row)}>
                      Düzenle
                    </Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => onDelete(row.id)}>
                      Sil
                    </Button>
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