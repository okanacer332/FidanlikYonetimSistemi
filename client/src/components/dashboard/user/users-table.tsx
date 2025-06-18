// Dosya Yolu: client/src/components/dashboard/user/users-table.tsx
'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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
import type { Role } from '@/types/user';
import { useUser } from '@/hooks/use-user';

// DÜZELTME: noop (hiçbir şey yapmayan) fonksiyon eklendi.
function noop(): void {
  // do nothing
}

export interface User {
  id: string;
  username: string;
  email: string;
  roles?: Role[];
  tenantId: string;
}

interface UsersTableProps {
  count?: number;
  rows?: User[];
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
}

export function UsersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  // DÜZELTME: onPageChange ve onRowsPerPageChange için varsayılan noop fonksiyonları atandı.
  onPageChange = noop,
  onRowsPerPageChange = noop,
  onEditUser,
  onDeleteUser,
}: UsersTableProps): React.JSX.Element {
  
  const { user: currentUser } = useUser();
  const isCurrentUserAdmin = currentUser?.roles?.some(role => role.name === 'Yönetici');

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Kullanıcı Adı</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Roller</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isOkanUser = row.username === 'okan';
              const canEdit = (isCurrentUserAdmin && !isOkanUser) || (!isCurrentUserAdmin && currentUser?.id === row.id);
              const canDelete = isCurrentUserAdmin && !isOkanUser;

              return (
                <TableRow
                  hover
                  key={row.id}
                  sx={{
                    ...(isOkanUser && isCurrentUserAdmin && {
                      backgroundColor: 'action.hover',
                      pointerEvents: 'none',
                      opacity: 0.7,
                    }),
                  }}
                >
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Avatar>{row.username.charAt(0).toUpperCase()}</Avatar>
                      <Typography variant="subtitle2">{row.username}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    {isOkanUser && isCurrentUserAdmin ? (
                      <Typography sx={{ color: 'text.disabled', fontStyle: 'italic' }}>Yönetici (Sistem)</Typography>
                    ) : (
                      row.roles && row.roles.length > 0
                        ? row.roles.map((role) => role.name).join(', ')
                        : 'Rol Yok'
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                        {onEditUser && canEdit && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => onEditUser(row)}
                            >
                                Düzenle
                            </Button>
                        )}
                        {onDeleteUser && canDelete && (
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => onDeleteUser(row.id)}
                            >
                                Sil
                            </Button>
                        )}
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