// client/src/app/dashboard/user-management/page.tsx
'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog'; // Dialog importu
import DialogTitle from '@mui/material/DialogTitle'; // DialogTitle importu
import DialogContent from '@mui/material/DialogContent'; // DialogContent importu
import DialogContentText from '@mui/material/DialogContentText'; // DialogContentText importu
import DialogActions from '@mui/material/DialogActions'; // DialogActions importu

import { UsersTable, User as TableUser } from '@/components/dashboard/user/users-table';
import { UserCreateForm } from '@/components/dashboard/user/user-create-form'; // '.tsx' uzantısı kaldırıldı
import { UserEditForm } from '@/components/dashboard/user/user-edit-form';   // '.tsx' uzantısı kaldırıldı


import { useUser } from '@/hooks/use-user';

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [users, setUsers] = React.useState<TableUser[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
  const [totalUsers, setTotalUsers] = React.useState<number>(0);

  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState<boolean>(false);
  const [isEditFormOpen, setIsEditFormOpen] = React.useState<boolean>(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = React.useState<TableUser | null>(null);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState<boolean>(false); // Yeni: Silme onayı modalı state'i
  const [userToDeleteId, setUserToDeleteId] = React.useState<string | null>(null); // Yeni: Silinecek kullanıcı ID'si

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
    fetchUsers();
    setIsCreateFormOpen(false);
  }, [fetchUsers]);

  const handleOpenEditForm = React.useCallback((user: TableUser) => {
    setSelectedUserToEdit(user);
    setIsEditFormOpen(true);
  }, []);

  const handleCloseEditForm = React.useCallback(() => {
    setIsEditFormOpen(false);
    setSelectedUserToEdit(null);
  }, []);

  const handleUserUpdated = React.useCallback(() => {
    fetchUsers();
    setIsEditFormOpen(false);
  }, [fetchUsers]);

  // Yeni: Silme onayı işlevselliği
  const handleOpenConfirmDelete = React.useCallback((userId: string) => {
    setUserToDeleteId(userId);
    setIsConfirmDeleteOpen(true);
  }, []);

  const handleCloseConfirmDelete = React.useCallback(() => {
    setIsConfirmDeleteOpen(false);
    setUserToDeleteId(null);
  }, []);

  const handleDeleteUser = React.useCallback(async () => {
    if (!userToDeleteId) {
      return;
    }

    // Backend'e DELETE isteği gönder
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Oturum tokenı bulunamadı.');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userToDeleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Hata yanıtını işleyin
        const errorData = await response.json(); // Hata mesajı JSON olarak gelmeli
        if (response.status === 403) {
            setError('Bu kullanıcıyı silmeye yetkiniz yok.');
        } else if (response.status === 404) {
            setError('Silinecek kullanıcı bulunamadı.');
        } else {
            setError(errorData.message || 'Kullanıcı silinirken bir hata oluştu.');
        }
        return;
      }

      fetchUsers(); // Başarılı silme sonrası listeyi yenile
      handleCloseConfirmDelete(); // Onay modalını kapat
      setError(null); // Başarılı işlemde hata mesajını temizle
    } catch (err) {
      console.error('Kullanıcı silme hatası:', err);
      setError('Kullanıcı silinirken bir ağ hatası oluştu.');
    }
  }, [userToDeleteId, fetchUsers, handleCloseConfirmDelete]);

  const paginatedUsers = React.useMemo(() => {
    return users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [users, page, rowsPerPage]);

  const canCreateUser = currentUser?.roles?.some(role => role.name === 'Yönetici');

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Kullanıcı Yönetimi</Typography>
        </Stack>
        <div>
          {canCreateUser && (
            <Button
              startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
              variant="contained"
              onClick={handleOpenCreateForm}
            >
              Yeni Kullanıcı Ekle
            </Button>
          )}
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
          onEditUser={handleOpenEditForm}
          onDeleteUser={handleOpenConfirmDelete} // Yeni prop'u bağladık
        />
      )}

      {canCreateUser && (
        <UserCreateForm
          open={isCreateFormOpen}
          onClose={handleCloseCreateForm}
          onSuccess={handleUserCreated}
        />
      )}

      <UserEditForm
        open={isEditFormOpen}
        onClose={handleCloseEditForm}
        onSuccess={handleUserUpdated}
        user={selectedUserToEdit}
      />

      {/* Yeni: Silme Onayı Modalı */}
      <Dialog
        open={isConfirmDeleteOpen}
        onClose={handleCloseConfirmDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Kullanıcıyı Silmek İstediğinize Emin Misiniz?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bu işlem geri alınamaz. Seçilen kullanıcı kalıcı olarak silinecektir.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDelete}>İptal</Button>
          <Button onClick={handleDeleteUser} color="error" autoFocus>
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}