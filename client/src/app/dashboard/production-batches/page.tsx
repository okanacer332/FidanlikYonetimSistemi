'use client';

import * as React from 'react';
import {
  Button, Stack, Typography, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Box
} from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';

import { useUser } from '@/hooks/use-user';
import type { ProductionBatch, MasterData } from '@/types/nursery';
import { ProductionBatchForm } from '@/components/dashboard/production-batch/production-batch-form'; // Birazdan oluşturacağız
import { ProductionBatchesTable } from '@/components/dashboard/production-batch/production-batches-table'; // Birazdan oluşturacağız

export default function Page(): React.JSX.Element {
    const { user: currentUser, isLoading: isUserLoading } = useUser();
    const [productionBatches, setProductionBatches] = React.useState<ProductionBatch[]>([]);
    const [masterData, setMasterData] = React.useState<MasterData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [pageError, setPageError] = React.useState<string | null>(null);

    const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
    const [selectedBatchToEdit, setSelectedBatchToEdit] = React.useState<ProductionBatch | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false);
    const [batchToDeleteId, setBatchToDeleteId] = React.useState<string | null>(null);
    const [deleteError, setDeleteError] = React.useState<string | null>(null);

    // Yetki kontrolü: ADMIN veya WAREHOUSE_STAFF rolleri olanlar bu sayfayı yönetebilir/görebilir
    const canManageProductionBatches = currentUser?.roles?.some(
        role => role.name === 'ADMIN' || role.name === 'WAREHOUSE_STAFF'
    );
    // Yetki kontrolü: Silme işlemi sadece ADMIN'e özel
    const canDeleteProductionBatches = currentUser?.roles?.some(
        role => role.name === 'ADMIN'
    );

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        setPageError(null);
        if (!canManageProductionBatches) {
            setPageError('Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.');
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            setPageError('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
            setLoading(false);
            return;
        }

        try {
            const [batchesRes, masterDataRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/production-batches`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/master-data`, { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);

            if (!batchesRes.ok) throw new Error((await batchesRes.json()).message || 'Üretim partileri yüklenemedi.');
            if (!masterDataRes.ok) throw new Error((await masterDataRes.json()).message || 'Ana veriler yüklenemedi.');

            setProductionBatches(await batchesRes.json());
            setMasterData(await masterDataRes.json());
        } catch (err: any) {
            setPageError(err.message);
        } finally {
            setLoading(false);
        }
    }, [canManageProductionBatches]);

    React.useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser, fetchData]);

    const handleFormSuccess = () => {
        setIsFormModalOpen(false);
        setSelectedBatchToEdit(null);
        fetchData(); // Verileri yeniden çek
    };

    const handleEditClick = (batch: ProductionBatch) => {
        setSelectedBatchToEdit(batch);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (batchId: string) => {
        setBatchToDeleteId(batchId);
        setIsConfirmDeleteOpen(true);
        setDeleteError(null);
    };

    const handleConfirmDelete = async () => {
        if (!batchToDeleteId) return;

        setDeleteError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/production-batches/${batchToDeleteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Üretim partisi silinemedi.');
            }
            setIsConfirmDeleteOpen(false);
            setBatchToDeleteId(null);
            fetchData();
        } catch (err: any) {
            setDeleteError(err.message);
        }
    };

    if (isUserLoading) {
        return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
    }

    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={3} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4">Üretim Partileri Yönetimi</Typography>
                <div>
                    {canManageProductionBatches && (
                        <Button
                            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                            variant="contained"
                            onClick={() => {
                                setSelectedBatchToEdit(null); // Yeni kayıt için formu sıfırla
                                setIsFormModalOpen(true);
                            }}
                        >
                            Yeni Parti Oluştur
                        </Button>
                    )}
                </div>
            </Stack>

            {pageError && <Alert severity="error">{pageError}</Alert>}

            {loading ? (
                <Stack sx={{ justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}><CircularProgress /></Stack>
            ) : canManageProductionBatches ? (
                <ProductionBatchesTable
                    rows={productionBatches}
                    onEdit={handleEditClick}
                    onDelete={canDeleteProductionBatches ? handleDeleteClick : undefined}
                />
            ) : null}
            
            {masterData && ( // masterData yüklendiğinde formu göster
                <ProductionBatchForm
                    open={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSuccess={handleFormSuccess}
                    productionBatch={selectedBatchToEdit}
                    masterData={masterData}
                />
            )}

            <Dialog open={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)}>
                <DialogTitle>Üretim Partisini Sil</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bu üretim partisini kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve ilişkili maliyet raporlarını etkileyebilir.
                    </DialogContentText>
                    {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsConfirmDeleteOpen(false)}>İptal</Button>
                    <Button onClick={handleConfirmDelete} color="error">Sil</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}