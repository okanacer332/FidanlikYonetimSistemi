// client/src/components/dashboard/user/users-table.tsx
'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useSelection } from '@/hooks/use-selection';
import type { User, Role } from '@/types/user'; // User ve Role interfacelerini types/user.ts'ten import et

function noop(): void {
  // do nothing
}

interface UsersTableProps {
  count?: number;
  page?: number;
  rows?: User[];
  rowsPerPage?: number;
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function UsersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onPageChange = noop,
  onRowsPerPageChange = noop,
}: UsersTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((user) => user.id);
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
              <TableCell padding="checkbox">
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
              </TableCell>
              <TableCell>Kullanıcı Adı</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Roller</TableCell>
              {/* Tenant ID sütununu kaldırdık */}
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              // 'okan' kullanıcısını belirliyoruz
              const isOkanUser = row.username === 'okan';
              const isSelected = selected?.has(row.id);

              return (
                <TableRow
                  hover
                  key={row.id}
                  selected={isSelected}
                  // 'okan' kullanıcısı için özel stil
                  sx={{
                    ...(isOkanUser && {
                      backgroundColor: 'action.hover', // Hafif farklı arkaplan
                      pointerEvents: 'none', // Satıra tıklama ve hover etkileşimlerini devre dışı bırak
                      opacity: 0.7, // Biraz daha silik görünmesini sağla
                    }),
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(row.id);
                        } else {
                          deselectOne(row.id);
                        }
                      }}
                      disabled={isOkanUser} // 'okan' kullanıcısını seçilemez yap
                    />
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Avatar>{row.username.charAt(0).toUpperCase()}</Avatar>
                      <Typography variant="subtitle2" sx={{ ...(isOkanUser && { color: 'text.disabled' }) }}>{row.username}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ ...(isOkanUser && { color: 'text.disabled' }) }}>
                    {row.email}
                  </TableCell>
                  <TableCell sx={{ ...(isOkanUser && { color: 'text.disabled' }) }}>
                    {isOkanUser ? (
                      <Typography sx={{ color: 'text.disabled', fontStyle: 'italic' }}>-</Typography> // 'okan' için "-" göster
                    ) : (
                      row.roles && row.roles.length > 0
                        ? row.roles.map((role) => role.name).join(', ')
                        : 'Rol Yok'
                    )}
                  </TableCell>
                  {/* Tenant ID hücremizi kaldırdık */}
                  <TableCell>
                    <Button variant="outlined" size="small" disabled={isOkanUser}>Düzenle</Button>
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