// client/src/app/dashboard/user-management/page.tsx
'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon, Pencil as PencilIcon, Trash as TrashIcon } from '@phosphor-icons/react';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { IconButton, Tooltip, Avatar } from '@mui/material';

import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { UserCreateForm } from '@/components/dashboard/user/user-create-form';
import { UserEditForm } from '@/components/dashboard/user/user-edit-form';
import { InlineCreateForm } from '@/components/common/InlineCreateForm';
import { PageHeader } from '@/components/common/PageHeader';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { useNotifier } from '@/hooks/useNotifier';
import { useUser } from '@/hooks/use-user';
import { useApiSWR } from '@/hooks/use-api-swr';
import { deleteUser } from '@/services/userService';
import type { User as UserType } from '@/types/user';

const useUsers = () => useApiSWR<UserType[]>('/users');

export default function Page(): React.JSX.Element {
    const notify = useNotifier();
    const { user: currentUser, isLoading: isUserLoading } = useUser();
    const { data: users, error: usersError, isLoading: isLoadingUsers, mutate: mutateUsers } = useUsers();

    const [isCreateFormOpen, setIsCreateFormOpen] = React.useState<boolean>(false);
    const [isEditFormOpen, setIsEditFormOpen] = React.useState<boolean>(false);
    const [selectedUserToEdit, setSelectedUserToEdit] = React.useState<UserType | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState<boolean>(false);
    const [userToDeleteId, setUserToDeleteId] = React.useState<string | null>(null);
    
    // YENİ EKLENEN STATE: Yeni eklenen satırın ID'sini tutar
    const [newlyAddedId, setNewlyAddedId] = React.useState<string | null>(null); 
    const [isTableLoading, setIsTableLoading] = React.useState(false);

    const isLoading = isUserLoading || isLoadingUsers;
    const error = usersError;

    const isCurrentUserAdmin = currentUser?.roles?.some(role => role.name === 'ADMIN');
    const roleTranslations: Record<string, string> = {
      'ADMIN': 'Yönetici',
      'SALES': 'Satış',
      'ACCOUNTANT': 'Muhasebeci',
      'WAREHOUSE_STAFF': 'Depo Personeli',
    };

    // DEĞİŞİKLİK BURADA: Yeni kullanıcının ID'si callback'ten alınacak
    const handleUserCreated = React.useCallback(async (newUserId: string) => {
        setIsCreateFormOpen(false);
        setNewlyAddedId(newUserId);
        await mutateUsers();
        setTimeout(() => setNewlyAddedId(null), 2000); // 2 saniye sonra vurguyu kaldır
        notify.success('Kullanıcı başarıyla oluşturuldu.');
    }, [mutateUsers, notify]);
    
    // Düzenleme başarılı olunca tetiklenecek callback
    const handleUserUpdated = React.useCallback(() => {
        setIsEditFormOpen(false);
        mutateUsers();
        notify.success('Kullanıcı bilgileri başarıyla güncellendi.');
    }, [mutateUsers, notify]);

    // Düzenleme ve silme modalını açan fonksiyonlar
    const handleOpenEditForm = (user: UserType) => { setSelectedUserToEdit(user); setIsEditFormOpen(true); };
    const handleOpenConfirmDelete = (id: string) => { setUserToDeleteId(id); setIsConfirmDeleteOpen(true); };

    // Silme işlemini onaylayan fonksiyon
    const handleConfirmDelete = React.useCallback(async () => {
        if (!userToDeleteId) return;
        setIsTableLoading(true);
        try {
            await deleteUser(userToDeleteId);
            notify.success('Kullanıcı başarıyla silindi.');
            mutateUsers();
        } catch (err: any) {
            notify.error(err.message);
        } finally {
            setIsConfirmDeleteOpen(false);
            setUserToDeleteId(null);
            setIsTableLoading(false);
        }
    }, [userToDeleteId, mutateUsers, notify]);

    // Tablo sütunlarını tanımlayan kısım
    const columns: ColumnDef<UserType>[] = React.useMemo(() => [
      { key: 'username', header: 'Kullanıcı Adı', render: (row) => (
        <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <Avatar>{row.username.charAt(0).toUpperCase()}</Avatar>
            <Typography variant="subtitle2">{row.username}</Typography>
        </Stack>
      )},
      { key: 'email', header: 'E-posta', render: (row) => row.email },
      { key: 'roles', header: 'Roller', render: (row) => (
        row.roles && row.roles.length > 0
          ? row.roles.map(role => roleTranslations[role.name] || role.name).join(', ')
          : 'Rol Yok'
      )},
      {
        key: 'actions',
        header: 'İşlemler',
        render: (row) => {
          const isOkanUser = row.username === 'okan';
          const canEdit = (isCurrentUserAdmin && !isOkanUser) || (!isCurrentUserAdmin && currentUser?.id === row.id);
          const canDelete = isCurrentUserAdmin && !isOkanUser;

          return (
            <Stack direction="row">
              {canEdit && <Tooltip title="Düzenle"><IconButton size="small" onClick={() => handleOpenEditForm(row)}><PencilIcon /></IconButton></Tooltip>}
              {canDelete && <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => handleOpenConfirmDelete(row.id)}><TrashIcon /></IconButton></Tooltip>}
            </Stack>
          );
        },
      },
    ], [isCurrentUserAdmin, currentUser, handleOpenEditForm, handleOpenConfirmDelete]);

    if (isLoading) {
        return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
    }

    if (error) {
        return <Alert severity="error">{error.message}</Alert>;
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
            <AppBreadcrumbs />
            <PageHeader 
              title="Kullanıcı Yönetimi"
              action={
                <Button startIcon={<PlusIcon />} variant="contained" onClick={() => setIsCreateFormOpen(prev => !prev)}>
                    Yeni Kullanıcı Ekle
                </Button>
              }
            />

            <InlineCreateForm
                title="Yeni Kullanıcı Ekle"
                isOpen={isCreateFormOpen}
                onClose={() => setIsCreateFormOpen(false)}
            >
                <UserCreateForm
                  onSuccess={handleUserCreated}
                  onCancel={() => setIsCreateFormOpen(false)}
                />
            </InlineCreateForm>
            
            <ActionableTable
              columns={columns}
              rows={users || []}
              count={users?.length || 0}
              page={0}
              rowsPerPage={10}
              onPageChange={() => {}}
              onRowsPerPageChange={() => {}}
              selectionEnabled={false}
              isLoading={isTableLoading}
              highlightedId={newlyAddedId} // YENİ EKLENEN ID BURAYA GÖNDERİLİYOR
              entity="users"
            />

            {selectedUserToEdit && (
              <UserEditForm 
                open={isEditFormOpen} 
                onClose={() => setIsEditFormOpen(false)} 
                onSuccess={handleUserUpdated} 
                user={selectedUserToEdit} 
              />
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