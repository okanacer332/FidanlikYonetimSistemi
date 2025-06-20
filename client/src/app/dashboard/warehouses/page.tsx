'use client';

import * as React from 'react';
import { Button, Stack, Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';

import { WarehousesTable } from '@/components/dashboard/warehouse/warehouses-table';
import { WarehouseCreateForm } from '@/components/dashboard/warehouse/warehouse-create-form';
import { WarehouseEditForm } from '@/components/dashboard/warehouse/warehouse-edit-form';
import type { Warehouse } from '@/types/nursery';
import { useUser } from '@/hooks/use-user';

export default function Page(): React.JSX.Element {
    const { user: currentUser, isLoading: isUserLoading } = useUser();
    const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
    const [isEditModalOpen, setEditModalOpen] = React.useState(false);
    const [isConfirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
    
    const [itemToEdit, setItemToEdit] = React.useState<Warehouse | null>(null);
    const [itemToDeleteId, setItemToDeleteId] = React.useState<string | null>(null);

    // UPDATED: Check for standardized role names
    const canListWarehouses = currentUser?.roles?.some(role =>
      role.name === 'ADMIN' || role.name === 'WAREHOUSE_STAFF' || role.name === 'SALES'
    );
    const canManageWarehouses = currentUser?.roles?.some(role =>
      role.name === 'ADMIN'
    );

    const fetchWarehouses = React.useCallback(async () => {
        if (!canListWarehouses) {
            setLoading(false);
            setError('Depoları listeleme yetkiniz bulunmamaktadır.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/warehouses`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Depolar yüklenemedi.');
            }
            const data = await response.json();
            setWarehouses(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [canListWarehouses]);

    React.useEffect(() => {
        if (currentUser) {
            fetchWarehouses();
        }
    }, [currentUser, fetchWarehouses]);

    const handleCreateSuccess = () => { setCreateModalOpen(false); fetchWarehouses(); };
    const handleEditClick = (warehouse: Warehouse) => { setItemToEdit(warehouse); setEditModalOpen(true); };
    const handleEditSuccess = () => { setEditModalOpen(false); setItemToEdit(null); fetchWarehouses(); };
    const handleDeleteClick = (warehouseId: string) => { setItemToDeleteId(warehouseId); setConfirmDeleteOpen(true); };
    
    const handleConfirmDelete = async () => {
        if (!itemToDeleteId) return;
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/warehouses/${itemToDeleteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                 const errData = await response.json();
                 throw new Error(errData.message || 'Depo silinemedi.');
            }
            
            fetchWarehouses();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setConfirmDeleteOpen(false);
            setItemToDeleteId(null);
        }
    };
    
    if (isUserLoading) {
      return <CircularProgress />;
    }

    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={3}>
                <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                    <Typography variant="h4">Depo Yönetimi</Typography>
                </Stack>
                <div>
                    {canManageWarehouses && (
                        <Button
                            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                            variant="contained"
                            onClick={() => setCreateModalOpen(true)}
                        >
                            Yeni Depo Ekle
                        </Button>
                    )}
                </div>
            </Stack>

            {loading ? (
                <Stack sx={{ alignItems: 'center', mt: 3 }}><CircularProgress /></Stack>
            ) : !canListWarehouses ? (
                <Alert severity="error">{error}</Alert>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <WarehousesTable
                    rows={warehouses}
                    onEdit={canManageWarehouses ? handleEditClick : undefined}
                    onDelete={canManageWarehouses ? handleDeleteClick : undefined}
                />
            )}
            
            {canManageWarehouses && (
                <>
                    <WarehouseCreateForm
                        open={isCreateModalOpen}
                        onClose={() => setCreateModalOpen(false)}
                        onSuccess={handleCreateSuccess}
                    />
                    <WarehouseEditForm
                        open={isEditModalOpen}
                        onClose={() => setEditModalOpen(false)}
                        onSuccess={handleEditSuccess}
                        warehouse={itemToEdit}
                    />
                </>
            )}

            <Dialog open={isConfirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
                <DialogTitle>Depoyu Silmek İstediğinize Emin Misiniz?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bu işlem geri alınamaz. Depo kalıcı olarak silinecektir.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteOpen(false)}>İptal</Button>
                    <Button onClick={handleConfirmDelete} color="error">Sil</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}