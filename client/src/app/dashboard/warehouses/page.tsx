// GÜNCELLENEN DOSYA YOLU: client/src/app/dashboard/warehouses/page.tsx
'use client';

import * as React from 'react';
import { Button, Stack, Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';

import { WarehousesTable } from '@/components/dashboard/warehouse/warehouses-table';
import { WarehouseCreateForm } from '@/components/dashboard/warehouse/warehouse-create-form';
import { WarehouseEditForm } from '@/components/dashboard/warehouse/warehouse-edit-form'; // DÜZENLEME FORMU IMPORT EDİLDİ
import type { Warehouse } from '@/types/nursery';

export default function Page(): React.JSX.Element {
    const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Modal state'leri
    const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
    const [isEditModalOpen, setEditModalOpen] = React.useState(false);
    const [isConfirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
    
    // İşlem yapılacak öğe state'leri
    const [itemToEdit, setItemToEdit] = React.useState<Warehouse | null>(null);
    const [itemToDeleteId, setItemToDeleteId] = React.useState<string | null>(null);

    const fetchWarehouses = React.useCallback(async () => {
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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    // ---- Create Handlers ----
    const handleCreateSuccess = () => {
        setCreateModalOpen(false);
        fetchWarehouses();
    };
    
    // ---- Edit Handlers ----
    const handleEditClick = (warehouse: Warehouse) => {
        setItemToEdit(warehouse);
        setEditModalOpen(true);
    };

    const handleEditSuccess = () => {
        setEditModalOpen(false);
        setItemToEdit(null);
        fetchWarehouses();
    };

    // ---- Delete Handlers ----
    const handleDeleteClick = (warehouseId: string) => {
        setItemToDeleteId(warehouseId);
        setConfirmDeleteOpen(true);
    };
    
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
            
            setConfirmDeleteOpen(false);
            setItemToDeleteId(null);
            fetchWarehouses();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Silme işlemi sırasında bir hata oluştu.');
            setConfirmDeleteOpen(false); // Hata durumunda da modalı kapat
        }
    };
    
    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={3}>
                <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                    <Typography variant="h4">Depo Yönetimi</Typography>
                </Stack>
                <div>
                    <Button
                        startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                        variant="contained"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        Yeni Depo Ekle
                    </Button>
                </div>
            </Stack>

            {loading ? (
                <Stack sx={{ alignItems: 'center', mt: 3 }}><CircularProgress /></Stack>
            ) : (
                <WarehousesTable rows={warehouses} onEdit={handleEditClick} onDelete={handleDeleteClick} />
            )}
            
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}


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