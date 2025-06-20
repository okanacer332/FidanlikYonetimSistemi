'use client';

import * as React from 'react';
import {
  Button, Stack, Typography, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';

import { useUser } from '@/hooks/use-user';
import { GoodsReceiptCreateForm } from '@/components/dashboard/goods-receipt/goods-receipt-create-form';
import { GoodsReceiptsTable, type GoodsReceiptRow } from '@/components/dashboard/goods-receipt/goods-receipts-table';
import type { Supplier, Warehouse } from '@/types/nursery';

// This is the raw type received from the backend
interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  supplierId: string;
  warehouseId: string;
  totalValue: number;
  status: 'COMPLETED' | 'CANCELED';
  receiptDate: string;
}

export default function Page(): React.JSX.Element {
    const { user: currentUser, isLoading: isUserLoading } = useUser();
    const [receipts, setReceipts] = React.useState<GoodsReceipt[]>([]);
    const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
    const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    
    const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
    const [isConfirmCancelOpen, setConfirmCancelOpen] = React.useState(false);
    const [itemToCancelId, setItemToCancelId] = React.useState<string | null>(null);

    const canManageReceipts = currentUser?.roles?.some(
        role => role.name === 'ADMIN' || role.name === 'WAREHOUSE_STAFF'
    );
    const canViewReceipts = currentUser?.roles?.some(
        role => role.name === 'ADMIN' || role.name === 'SALES' || role.name === 'WAREHOUSE_STAFF'
    );

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Oturum bulunamadı.');
            setLoading(false);
            return;
        }

        try {
            const [receiptsRes, suppliersRes, warehousesRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/goods-receipts`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/warehouses`, { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);

            if (!receiptsRes.ok || !suppliersRes.ok || !warehousesRes.ok) throw new Error('Veriler yüklenirken bir hata oluştu.');
            
            setReceipts(await receiptsRes.json());
            setSuppliers(await suppliersRes.json());
            setWarehouses(await warehousesRes.json());

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (canViewReceipts) {
            fetchData();
        } else if (!isUserLoading) {
            setLoading(false);
            setError('Mal giriş kayıtlarını görüntüleme yetkiniz bulunmamaktadır.');
        }
    }, [canViewReceipts, fetchData, isUserLoading]);

    const handleCreateSuccess = () => {
        setCreateModalOpen(false);
        fetchData();
    };

    const handleCancelClick = (receiptId: string) => {
        setItemToCancelId(receiptId);
        setConfirmCancelOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!itemToCancelId) return;
        
        setError(null);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/goods-receipts/${itemToCancelId}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                 const errData = await response.json();
                 throw new Error(errData.message || 'Kayıt iptal edilemedi.');
            }
            fetchData(); 
        } catch (err: any) {
            setError(err.message);
        } finally {
            setConfirmCancelOpen(false);
            setItemToCancelId(null);
        }
    };

    const preparedData = React.useMemo((): GoodsReceiptRow[] => {
        const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));
        const warehouseMap = new Map(warehouses.map(w => [w.id, w.name]));

        return receipts.map(receipt => ({
            ...receipt,
            supplierName: supplierMap.get(receipt.supplierId) || 'Bilinmeyen Tedarikçi',
            warehouseName: warehouseMap.get(receipt.warehouseId) || 'Bilinmeyen Depo',
        })).sort((a, b) => new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime());
    }, [receipts, suppliers, warehouses]);
    
    if (isUserLoading) {
        return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
    }
      
    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={3}>
                <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                    <Typography variant="h4">Mal Girişi</Typography>
                    <Typography variant="body1">
                        Tedarikçilerden gelen fidanların stok girişlerini yapın ve geçmiş kayıtları görüntüleyin.
                    </Typography>
                </Stack>
                <div>
                    {canManageReceipts && (
                        <Button
                            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                            variant="contained"
                            onClick={() => setCreateModalOpen(true)}
                        >
                            Yeni Giriş Yap
                        </Button>
                    )}
                </div>
            </Stack>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            {loading ? (
                <Stack sx={{justifyContent: 'center', alignItems: 'center', minHeight: '300px'}}><CircularProgress /></Stack>
            ) : (
                <GoodsReceiptsTable rows={preparedData} onCancel={handleCancelClick} canCancel={!!canManageReceipts} />
            )}
            
            <GoodsReceiptCreateForm
                open={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            <Dialog open={isConfirmCancelOpen} onClose={() => setConfirmCancelOpen(false)}>
                <DialogTitle>Girişi İptal Et</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bu mal giriş kaydını iptal etmek istediğinizden emin misiniz? Bu işlem, ilgili fidanları stoktan düşecektir ve geri alınamaz.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmCancelOpen(false)}>Vazgeç</Button>
                    <Button onClick={handleConfirmCancel} color="error">Evet, İptal Et</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}