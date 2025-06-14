// client/src/app/dashboard/user-management/page.tsx
'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { UsersTable, User as TableUser } from '@/components/dashboard/user/users-table';
import { UserCreateForm } from '@/components/dashboard/user/user-create-form.tsx'; // <<-- Burayı kontrol edin
import { useUser } from '@/hooks/use-user';

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [users, setUsers] = React.useState<TableUser[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
  const [totalUsers, setTotalUsers] = React.useState<number>(0);

  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState<boolean>(false); // Modal state'i

  const fetchUsers = React.useCallback(async () => {
    if (!currentUser || !currentUser.tenantId) {
      setError('Kullanıcı veya şirket bilgisi bulunamadı.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Oturum tokenı bulunamadı.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Kullanıcılar alınamadı.');
        setUsers([]);
        setTotalUsers(0);
        return;
      }

      setUsers(data);
      setTotalUsers(data.length);
    } catch (err) {
      console.error('Kullanıcıları çekerken hata:', err);
      setError('Kullanıcıları çekerken bir ağ hatası oluştu.');
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = React.useCallback((event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleOpenCreateForm = React.useCallback(() => {
    setIsCreateFormOpen(true);
  }, []);

  const handleCloseCreateForm = React.useCallback(() => {
    setIsCreateFormOpen(false);
  }, []);

  const handleUserCreated = React.useCallback(() => {
    fetchUsers(); // Yeni kullanıcı eklendiğinde listeyi yenile
  }, [fetchUsers]);

  const paginatedUsers = React.useMemo(() => {
    return users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [users, page, rowsPerPage]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Kullanıcı Yönetimi</Typography>
        </Stack>
        <div>
          <Button
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
            onClick={handleOpenCreateForm}
          >
            Yeni Kullanıcı Ekle
          </Button>
        </div>
      </Stack>
      {loading ? (
        <Stack sx={{ alignItems: 'center', justifyContent: 'center', height: '200px' }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>Kullanıcılar yükleniyor...</Typography>
        </Stack>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <UsersTable
          count={totalUsers}
          page={page}
          rows={paginatedUsers}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}

      <UserCreateForm
        open={isCreateFormOpen}
        onClose={handleCloseCreateForm}
        onSuccess={handleUserCreated}
      />
    </Stack>
  );
}