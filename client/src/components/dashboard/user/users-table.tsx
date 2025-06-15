// client/src/components/dashboard/user/users-table.tsx
'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
// import Checkbox from '@mui/material/Checkbox'; // Checkbox'ı kaldırdık
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
    // Checkbox kaldırıldığı için useSelection'a da gerek kalmayabilir,
    // ancak başka bir yerde kullanılıyorsa kalsın. Şimdilik props'tan kaldırmıyorum.
    return rows.map((user) => user.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds); // Kullanılmasa da kalabilir
  const { user: currentUser } = useUser();

  // const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length; // Kullanım dışı
  // const selectedAll = rows.length > 0 && selected?.size === rows.length; // Kullanım dışı

  const isCurrentUserAdmin = currentUser?.roles?.some(role => role.name === 'Yönetici');

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              {/* Checkbox sütununu kaldırdık */}
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
              <TableCell>Kullanıcı Adı</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Roller</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isOkanUser = row.username === 'okan';
              // const isSelected = selected?.has(row.id); // Kullanım dışı

              // Butonun etkinliğini belirleme
              const canEditOrDelete = (isCurrentUserAdmin && !isOkanUser) || (!isCurrentUserAdmin && currentUser?.id === row.id);

              // Silik ton için stil koşulu
              const isDimmed = !canEditOrDelete; // Eğer düzenleme yapılamıyorsa silik olsun

              return (
                <TableRow
                  hover
                  key={row.id}
                  // selected={isSelected} // Kullanım dışı
                  sx={{
                    // Okan kullanıcısı ve Admin ise özel stil (satırı soluklaştırma)
                    ...(isOkanUser && isCurrentUserAdmin && {
                      backgroundColor: 'action.hover',
                      pointerEvents: 'none',
                      opacity: 0.7,
                    }),
                  }}
                >
                  {/* Checkbox hücresini kaldırdık */}
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
                      disabled={isOkanUser}
                    />
                  </TableCell> */}
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Avatar>{row.username.charAt(0).toUpperCase()}</Avatar>
                      {/* Kullanıcı adı için silik ton */}
                      <Typography variant="subtitle2" sx={{ ...(isDimmed && { color: 'text.disabled' }) }}>{row.username}</Typography>
                    </Stack>
                  </TableCell>
                  {/* E-posta için silik ton */}
                  <TableCell sx={{ ...(isDimmed && { color: 'text.disabled' }) }}>
                    {row.email}
                  </TableCell>
                  {/* Roller için silik ton */}
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
                    <Button
                        variant="outlined"
                        size="small"
                        disabled={!canEditOrDelete}
                    >
                        Düzenle
                    </Button>
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