// GÜNCELLENEN DOSYA YOLU: client/src/app/dashboard/warehouses/page.tsx
'use client';

import * as React from 'react';
import { Button, Stack, Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';

import { WarehousesTable } from '@/components/dashboard/warehouse/warehouses-table';
import { WarehouseCreateForm } from '@/components/dashboard/warehouse/warehouse-create-form';
import { WarehouseEditForm } from '@/components/dashboard/warehouse/warehouse-edit-form';
import type { Warehouse } from '@/types/nursery';
import { useUser } from '@/hooks/use-user'; // useUser hook'unu import ettik

export default function Page(): React.JSX.Element {
    const { user: currentUser } = useUser(); // currentUser bilgisini alıyoruz
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

    // Yetki kontrolü
    const canListWarehouses = currentUser?.roles?.some(role =>
      role.name === 'Yönetici' || role.name === 'Depo Sorumlusu' || role.name === 'Satış Personeli'
    );
    // Sadece Yönetici depo oluşturma, düzenleme ve silme yetkisine sahip
    const canManageWarehouses = currentUser?.roles?.some(role =>
      role.name === 'Yönetici'
    );
    const canDeleteWarehouses = currentUser?.roles?.some(role =>
      role.name === 'Yönetici'
    );


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
        if (canListWarehouses) { // Sadece listeleme yetkisi olanlar veriyi çekebilsin
            fetchWarehouses();
        } else {
            setLoading(false);
            setError('Depo listeleme yetkiniz bulunmamaktadır.');
        }
    }, [fetchWarehouses, canListWarehouses]);

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
            setConfirmDeleteOpen(false);
        }
    };
    
    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={3}>
                <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                    <Typography variant="h4">Depo Yönetimi</Typography>
                </Stack>
                <div>
                    {canManageWarehouses && ( // Sadece Yönetici ekleme butonu görebilsin
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
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            ) : (
                <WarehousesTable
                    rows={warehouses}
                    // Sadece Yönetici düzenleme butonu görebilsin
                    onEdit={canManageWarehouses ? handleEditClick : () => { /* noop */ }}
                    // Sadece Yönetici silme butonu görebilsin
                    onDelete={canDeleteWarehouses ? handleDeleteClick : () => { /* noop */ }}
                />
            )}
            
            {canManageWarehouses && ( // Sadece Yönetici formu açabilsin
                <WarehouseCreateForm
                    open={isCreateModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}
            
            {canManageWarehouses && ( // Sadece Yönetici formu açabilsin
                <WarehouseEditForm
                    open={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onSuccess={handleEditSuccess}
                    warehouse={itemToEdit}
                />
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