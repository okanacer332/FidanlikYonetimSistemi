// client/src/components/dashboard/customer/customers-table.tsx
'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox'; // Bu hala kullanılıyorsa kalsın, yoksa kaldırılabilir.
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'; // Eklendi
// import dayjs from 'dayjs'; // createdAt kaldırıldıysa bu import'a gerek kalmaz

import { useSelection } from '@/hooks/use-selection'; // Kullanılıyorsa kalsın
import type { Customer } from '@/types/nursery'; // Güncellenen Customer tipi

function noop(): void {
  // do nothing
}

interface CustomersTableProps {
  count?: number;
  page?: number;
  rows?: Customer[];
  rowsPerPage?: number;
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void; // Eklendi
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; // Eklendi
  onEdit: (customer: Customer) => void; // Eklendi
  onDelete: (customerId: string) => void; // Eklendi
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
  const rowIds = React.useMemo(() => {
    return rows.map((customer) => customer.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              {/* Checkbox sütununu kaldırıyorum, müşteriler için toplu işlem şu an yok */}
              {/* <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      selectAll();
                    } else {
                      deselectAll();
                    }
                  }}
                />
              </TableCell> */}
              <TableCell>Adı Soyadı</TableCell>
              <TableCell>Şirket Adı</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Adres</TableCell>
              {/* <TableCell>Kayıt Tarihi</TableCell> // createdAt kaldırıldıysa bu sütunu da kaldırın */}
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              // const isSelected = selected?.has(row.id); // Checkbox kaldırıldığı için gerek kalmaz

              return (
                <TableRow hover key={row.id}> {/* selected={isSelected} kaldırıldı */}
                  {/* <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(row.id);
                        } else {
                          deselectOne(row.id);
                        }
                      }}
                    />
                  </TableCell> */}
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      {/* Avatar alanı kaldırılıyor, Customer modelinde avatar yok */}
                      {/* <Avatar src={row.avatar} /> */}
                      <Typography variant="subtitle2">{row.firstName} {row.lastName}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.companyName || '-'}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.address}</TableCell>
                  {/* <TableCell>{dayjs(row.createdAt).format('MMM D, YYYY')}</TableCell> // createdAt kaldırıldıysa */}
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
              );
            })}
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