// client/src/components/dashboard/user/users-table.tsx
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
import { useSelection } from '@/hooks/use-selection';
import type { User, Role } from '@/types/user';
import { useUser } from '@/hooks/use-user';

function noop(): void {
  // do nothing
}

export interface UsersTableProps {
  count?: number;
  page?: number;
  rows?: User[];
  rowsPerPage?: number;
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void; // Yeni prop: Silme butonu için callback
}

export function UsersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onPageChange = noop,
  onRowsPerPageChange = noop,
  onEditUser,
  onDeleteUser, // Yeni prop'u aldık
}: UsersTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((user) => user.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);
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

              // Admin: Okan değilse veya Kendi ise ( Okan Admin ise ve Okan değilse ) veya ( Okan Admin değilse ve kendi ise )
              const canEdit = (isCurrentUserAdmin && !isOkanUser) || (!isCurrentUserAdmin && currentUser?.id === row.id);

              // Sadece Adminler silebilir ve Okan kendini silemez
              const canDelete = isCurrentUserAdmin && !isOkanUser;

              const isDimmed = !canEdit && !canDelete; // Hem düzenleme hem silme yapılamıyorsa silik olsun

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
                      <Typography variant="subtitle2" sx={{ ...(isDimmed && { color: 'text.disabled' }) }}>{row.username}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ ...(isDimmed && { color: 'text.disabled' }) }}>
                    {row.email}
                  </TableCell>
                  <TableCell sx={{ ...(isDimmed && { color: 'text.disabled' }) }}>
                    {isOkanUser && isCurrentUserAdmin ? (
                      <Typography sx={{ color: 'text.disabled', fontStyle: 'italic' }}>Yönetici (Sistem)</Typography>
                    ) : (
                      row.roles && row.roles.length > 0
                        ? row.roles.map((role) => role.name).join(', ')
                        : 'Rol Yok'
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}> {/* Butonları yan yana koymak için Stack ekledik */}
                        <Button
                            variant="outlined"
                            size="small"
                            disabled={!canEdit}
                            onClick={() => onEditUser(row)}
                        >
                            Düzenle
                        </Button>
                        {canDelete && ( // Sadece silme yetkisi varsa butonu göster
                            <Button
                                variant="outlined"
                                color="error" // Kırmızı renk
                                size="small"
                                onClick={() => onDeleteUser(row.id)} // Tıklanınca silme callback'ini tetikle
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