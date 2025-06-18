// client/src/app/dashboard/suppliers/page.tsx
'use client';

import * as React from 'react';
import { Button, Stack, Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';

import { SuppliersTable } from '@/components/dashboard/supplier/suppliers-table';
import { SupplierCreateForm } from '@/components/dashboard/supplier/supplier-create-form';
import { SupplierEditForm } from '@/components/dashboard/supplier/supplier-edit-form';
import type { Supplier } from '@/types/nursery';
import { useUser } from '@/hooks/use-user'; // Yetkilendirme için User hook'unu import edin

export default function Page(): React.JSX.Element {
    const { user: currentUser } = useUser();
    const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Modal state'leri
    const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
    const [isEditModalOpen, setEditModalOpen] = React.useState(false);
    const [isConfirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
    
    // İşlem yapılacak öğe state'leri
    const [itemToEdit, setItemToEdit] = React.useState<Supplier | null>(null);
    const [itemToDeleteId, setItemToDeleteId] = React.useState<string | null>(null);

    // Yetki kontrolü
    const canManageSuppliers = currentUser?.roles?.some(role => 
      role.name === 'Yönetici' || role.name === 'Depo Sorumlusu'
    );
    const canDeleteSuppliers = currentUser?.roles?.some(role => 
      role.name === 'Yönetici'
    );

    const fetchSuppliers = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Tedarikçiler yüklenemedi.');
            }
            const data = await response.json();
            setSuppliers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (canManageSuppliers) { // Sadece yetkili kullanıcılar veriyi çekebilir
            fetchSuppliers();
        } else {
            setLoading(false);
            setError('Tedarikçi listeleme yetkiniz bulunmamaktadır.');
        }
    }, [fetchSuppliers, canManageSuppliers]);

    // ---- Create Handlers ----
    const handleCreateSuccess = () => {
        setCreateModalOpen(false);
        fetchSuppliers();
    };
    
    // ---- Edit Handlers ----
    const handleEditClick = (supplier: Supplier) => {
        setItemToEdit(supplier);
        setEditModalOpen(true);
    };

    const handleEditSuccess = () => {
        setEditModalOpen(false);
        setItemToEdit(null);
        fetchSuppliers();
    };

    // ---- Delete Handlers ----
    const handleDeleteClick = (supplierId: string) => {
        setItemToDeleteId(supplierId);
        setConfirmDeleteOpen(true);
    };
    
    const handleConfirmDelete = async () => {
        if (!itemToDeleteId) return;
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');
            
            // Hata ayıklama için console logları
            console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
            const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers/${itemToDeleteId}`;
            console.log('DELETE URL:', url);

            const response = await fetch(url, { // Oluşturulan 'url' değişkenini kullanıyoruz
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                 const errData = await response.json();
                 throw new Error(errData.message || 'Tedarikçi silinemedi.');
            }
            
            setConfirmDeleteOpen(false);
            setItemToDeleteId(null);
            fetchSuppliers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
            setConfirmDeleteOpen(false); // Hata durumunda da modalı kapat
        }
    };
    
    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={3}>
                <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                    <Typography variant="h4">Tedarikçi Yönetimi</Typography>
                </Stack>
                <div>
                    {canManageSuppliers && (
                        <Button
                            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                            variant="contained"
                            onClick={() => setCreateModalOpen(true)}
                        >
                            Yeni Tedarikçi Ekle
                        </Button>
                    )}
                </div>
            </Stack>

            {loading ? (
                <Stack sx={{ alignItems: 'center', mt: 3 }}><CircularProgress /></Stack>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            ) : (
                <SuppliersTable 
                    rows={suppliers} 
                    onEdit={canManageSuppliers ? handleEditClick : () => {}} // Yetki yoksa düzenlemeyi devre dışı bırak
                    onDelete={canDeleteSuppliers ? handleDeleteClick : () => {}} // Yetki yoksa silmeyi devre dışı bırak
                />
            )}
            
            {canManageSuppliers && (
                <SupplierCreateForm 
                    open={isCreateModalOpen} 
                    onClose={() => setCreateModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                /> 
            )}
            
            {canManageSuppliers && (
                <SupplierEditForm
                    open={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onSuccess={handleEditSuccess}
                    supplier={itemToEdit}
                />
            )}

            <Dialog open={isConfirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
                <DialogTitle>Tedarikçiyi Silmek İstediğinize Emin Misiniz?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bu işlem geri alınamaz. Tedarikçi kalıcı olarak silinecektir.
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