'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

import { UsersTable, User as TableUser } from '@/components/dashboard/user/users-table';
import { UserCreateForm } from '@/components/dashboard/user/user-create-form';
import { UserEditForm } from '@/components/dashboard/user/user-edit-form';

import { useUser } from '@/hooks/use-user';

export default function Page(): React.JSX.Element {
    const { user: currentUser, isLoading: isUserLoading } = useUser();
    const [users, setUsers] = React.useState<TableUser[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [page, setPage] = React.useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
    const [totalUsers, setTotalUsers] = React.useState<number>(0);

    const [isCreateFormOpen, setIsCreateFormOpen] = React.useState<boolean>(false);
    const [isEditFormOpen, setIsEditFormOpen] = React.useState<boolean>(false);
    const [selectedUserToEdit, setSelectedUserToEdit] = React.useState<TableUser | null>(null);

    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState<boolean>(false);
    const [userToDeleteId, setUserToDeleteId] = React.useState<string | null>(null);

    const isCurrentUserAdmin = currentUser?.roles?.some(role => role.name === 'Yönetici');

    const fetchUsers = React.useCallback(async () => {
        if (!isCurrentUserAdmin) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum tokenı bulunamadı.');

            // DÜZELTME: API yolu environment değişkeninden alınarak düzeltildi.
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Kullanıcılar yüklenemedi.');
            }

            const data = await response.json();
            setUsers(data);
            setTotalUsers(data.length);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [isCurrentUserAdmin]);

    React.useEffect(() => {
        if (currentUser) {
            fetchUsers();
        }
    }, [currentUser, fetchUsers]);

    const handleUserCreated = () => { fetchUsers(); setIsCreateFormOpen(false); };
    const handleUserUpdated = () => { fetchUsers(); setIsEditFormOpen(false); };
    
    const handleOpenEditForm = (user: TableUser) => { setSelectedUserToEdit(user); setIsEditFormOpen(true); };
    const handleOpenConfirmDelete = (id: string) => { setUserToDeleteId(id); setIsConfirmDeleteOpen(true); };

    const handleConfirmDelete = async () => {
        if (!userToDeleteId) return;
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');

            // DÜZELTME: API yolu environment değişkeninden alınarak düzeltildi.
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userToDeleteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Kullanıcı silinemedi.');
            }
            fetchUsers();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsConfirmDeleteOpen(false);
            setUserToDeleteId(null);
        }
    };

    if (isUserLoading) {
        return <CircularProgress />;
    }

    if (!isCurrentUserAdmin) {
        return (
            <Stack spacing={3}>
                <Typography variant="h4">Kullanıcı Yönetimi</Typography>
                <Alert severity="error">Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</Alert>
            </Stack>
        );
    }
    
    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={3}>
                <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                    <Typography variant="h4">Kullanıcı Yönetimi</Typography>
                </Stack>
                <div>
                    <Button startIcon={<PlusIcon />} variant="contained" onClick={() => setIsCreateFormOpen(true)}>
                        Yeni Kullanıcı Ekle
                    </Button>
                </div>
            </Stack>

            {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
                <UsersTable
                    rows={users}
                    onEditUser={handleOpenEditForm}
                    onDeleteUser={handleOpenConfirmDelete}
                />
            )}

            <UserCreateForm open={isCreateFormOpen} onClose={() => setIsCreateFormOpen(false)} onSuccess={handleUserCreated} />
            
            {selectedUserToEdit && (
              <UserEditForm open={isEditFormOpen} onClose={() => setIsEditFormOpen(false)} onSuccess={handleUserUpdated} user={selectedUserToEdit} />
            )}

            <Dialog open={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)}>
                <DialogTitle>Kullanıcıyı Sil</DialogTitle>
                <DialogContent><DialogContentText>Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsConfirmDeleteOpen(false)}>İptal</Button>
                    <Button onClick={handleConfirmDelete} color="error">Sil</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}