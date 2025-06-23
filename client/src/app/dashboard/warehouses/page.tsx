'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import {
  Stack, Typography, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';

import { useUser } from '@/hooks/use-user';
// DEĞİŞİKLİK: Doğru tiplerin import edildiğinden emin olalım
import type { Warehouse } from '@/types/nursery';
import { WarehouseCreateInline } from '@/components/dashboard/warehouse/warehouse-create-inline';
import { WarehouseEditForm } from '@/components/dashboard/warehouse/warehouse-edit-form';
import { WarehousesTable } from '@/components/dashboard/warehouse/warehouses-table';


interface WarehouseFormValues {
    name: string;
    location: string;
}

const schema = zod.object({
  name: zod.string().min(1, 'Depo adı zorunludur.'),
  location: zod.string().min(1, 'Konum bilgisi zorunludur.'),
});

export default function Page(): React.JSX.Element {
    const { user: currentUser } = useUser();
    const [loading, setLoading] = React.useState(true);
    const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
    const [pageError, setPageError] = React.useState<string | null>(null);

    // Modallar için state'ler
    const [isEditModalOpen, setEditModalOpen] = React.useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = React.useState<Warehouse | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false);
    const [warehouseToDeleteId, setWarehouseToDeleteId] = React.useState<string | null>(null);
    const [deleteError, setDeleteError] = React.useState<string | null>(null);

    // Yetki kontrolleri
    const canManageWarehouses = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'WAREHOUSE_STAFF');

    const { control, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<WarehouseFormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', location: '' },
    });

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        setPageError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/warehouses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Depolar yüklenemedi (Hata: ${response.status})`);
            setWarehouses(await response.json());
        } catch (err) {
            setPageError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (canManageWarehouses) { fetchData(); }
        else { setLoading(false); setPageError('Bu sayfayı görüntüleme yetkiniz yok.'); }
    }, [canManageWarehouses, fetchData]);

    const onSubmit = React.useCallback(async (values: WarehouseFormValues) => {
        setError('root', {});
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/warehouses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(values),
            });
            if (!response.ok) {
                throw new Error((await response.json()).message || 'Depo oluşturulamadı.');
            }
            reset(); 
            await fetchData();
        } catch (err) {
            setError('root', { type: 'server', message: err instanceof Error ? err.message : 'Bir hata oluştu.' });
        }
    }, [fetchData, reset, setError]);

    const handleEditClick = React.useCallback((warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
        setEditModalOpen(true);
    }, []);

    const handleEditSuccess = React.useCallback(() => {
        setEditModalOpen(false);
        setSelectedWarehouse(null);
        fetchData();
    }, [fetchData]);

    const handleDeleteClick = React.useCallback((warehouseId: string) => {
        setWarehouseToDeleteId(warehouseId);
        setIsConfirmDeleteOpen(true);
        setDeleteError(null);
    }, []);

    const handleCloseDeleteConfirm = React.useCallback(() => {
        setIsConfirmDeleteOpen(false);
        setWarehouseToDeleteId(null);
        setDeleteError(null);
    }, []);

    const handleConfirmDelete = React.useCallback(async () => {
        if (!warehouseToDeleteId) return;
        setDeleteError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/warehouses/${warehouseToDeleteId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) { throw new Error((await response.json()).message || 'Depo silinemedi.'); }
            handleCloseDeleteConfirm();
            await fetchData();
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Silme işlemi sırasında bir hata oluştu.');
        }
    }, [warehouseToDeleteId, fetchData, handleCloseDeleteConfirm]);

    if (loading) {
        return (
            <Stack sx={{ width: '100%', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <CircularProgress />
                <Typography sx={{mt: 2}}>Veriler yükleniyor...</Typography>
            </Stack>
        );
    }

    return (
        <Stack spacing={3}>
            <Typography variant="h5">Depo Yönetimi</Typography>
            {pageError && <Alert severity="error">{pageError}</Alert>}
            
            {canManageWarehouses && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <WarehouseCreateInline
                        control={control}
                        errors={errors}
                        isSubmitting={isSubmitting}
                    />
                </form>
            )}
            
            <WarehousesTable
                rows={warehouses}
                onEdit={canManageWarehouses ? handleEditClick : undefined}
                onDelete={canManageWarehouses ? handleDeleteClick : undefined}
            />

            {canManageWarehouses && <WarehouseEditForm open={isEditModalOpen} onClose={() => setEditModalOpen(false)} onSuccess={handleEditSuccess} warehouse={selectedWarehouse}/>}

            <Dialog open={isConfirmDeleteOpen} onClose={handleCloseDeleteConfirm}>
                <DialogTitle>Depoyu Sil</DialogTitle>
                <DialogContent>
                    <DialogContentText>Bu depoyu kalıcı olarak silmek istediğinizden emin misiniz?</DialogContentText>
                    {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteConfirm}>İptal</Button>
                    <Button onClick={handleConfirmDelete} color="error">Sil</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}