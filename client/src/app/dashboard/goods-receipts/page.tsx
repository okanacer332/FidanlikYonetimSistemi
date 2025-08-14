'use client';

import * as React from 'react';
import { Stack, CircularProgress, Alert, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Plus as PlusIcon, XCircle as CancelIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';

import { useUser } from '@/hooks/use-user';
import type { GoodsReceipt, Supplier, Warehouse, ProductionBatch } from '@/types/nursery';
import { useApiSWR } from '@/hooks/use-api-swr';
import { useNotifier } from '@/hooks/useNotifier';

// --- ORTAK BİLEŞENLER ---
import { PageHeader } from '@/components/common/PageHeader';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { StatusChip } from '@/components/common/StatusChip';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { InlineCreateForm } from '@/components/common/InlineCreateForm';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


// --- MODÜLE ÖZEL FORM BİLEŞENLERİ ---
import { GoodsReceiptCreateForm } from '@/components/dashboard/goods-receipt/goods-receipt-create-form';

export interface GoodsReceiptRow extends GoodsReceipt {
  sourceName: string;
  warehouseName: string;
}

// Veri çekme hook'ları
const useGoodsReceipts = () => useApiSWR<GoodsReceipt[]>('/goods-receipts');
const useSuppliers = () => useApiSWR<Supplier[]>('/suppliers');
const useWarehouses = () => useApiSWR<Warehouse[]>('/warehouses');
const useProductionBatches = () => useApiSWR<ProductionBatch[]>('/production-batches');

export default function Page(): React.JSX.Element {
    const notify = useNotifier();
    const { user: currentUser, isLoading: isUserLoading } = useUser();

    // SWR ile veri çekme
    const { data: receiptsData, error: receiptsError, isLoading: isLoadingReceipts, mutate: mutateReceipts } = useGoodsReceipts();
    const { data: suppliersData, error: suppliersError, isLoading: isLoadingSuppliers } = useSuppliers();
    const { data: warehousesData, error: warehousesError, isLoading: isLoadingWarehouses } = useWarehouses();
    const { data: batchesData, error: batchesError, isLoading: isLoadingBatches } = useProductionBatches();

    // Tablo state'leri
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [order, setOrder] = React.useState<'asc' | 'desc'>('desc');
    const [orderBy, setOrderBy] = React.useState<string>('receiptDate');
    const [newlyAddedReceiptId, setNewlyAddedReceiptId] = React.useState<string | null>(null);

    const [isCreateFormOpen, setCreateFormOpen] = React.useState(false);
    const [isConfirmCancelOpen, setConfirmCancelOpen] = React.useState(false);
    const [itemToCancel, setItemToCancel] = React.useState<GoodsReceiptRow | null>(null);

    const isLoading = isLoadingReceipts || isLoadingSuppliers || isLoadingWarehouses || isLoadingBatches || isUserLoading;
    const error = receiptsError || suppliersError || warehousesError || batchesError;

    const canManageReceipts = currentUser?.roles?.some(role => ['ADMIN', 'WAREHOUSE_STAFF'].includes(role.name));
    const canViewReceipts = currentUser?.roles?.some(role => ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'].includes(role.name));

    const handleSuccess = (message: string, newReceipt?: GoodsReceipt) => {
        setCreateFormOpen(false);
        notify.success(message);
        if (newReceipt) {
            setNewlyAddedReceiptId(newReceipt.id);
            setTimeout(() => setNewlyAddedReceiptId(null), 2000);
        }
        mutateReceipts();
    };

    const handleCancelClick = (receipt: GoodsReceiptRow) => {
        setItemToCancel(receipt);
        setConfirmCancelOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!itemToCancel) return;
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/goods-receipts/${itemToCancel.id}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                 const errData = await response.json();
                 throw new Error(errData.message || 'Kayıt iptal edilemedi.');
            }
            notify.success("Mal girişi başarıyla iptal edildi.");
            mutateReceipts(); 
        } catch (err: any) {
            notify.error(err.message);
        } finally {
            setConfirmCancelOpen(false);
            setItemToCancel(null);
        }
    };

    const handleRequestSort = React.useCallback((property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    }, [order, orderBy]);

    const sortedAndFilteredData = React.useMemo((): GoodsReceiptRow[] => {
        const receipts = receiptsData || [];
        const suppliers = suppliersData || [];
        const warehouses = warehousesData || [];
        const batches = batchesData || [];

        const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));
        const warehouseMap = new Map(warehouses.map(w => [w.id, w.name]));
        const batchMap = new Map(batches.map(b => [b.id, b.batchName]));

        const preparedData: GoodsReceiptRow[] = receipts.map(receipt => ({
            ...receipt,
            sourceName: receipt.sourceType === 'SUPPLIER'
                ? supplierMap.get(receipt.sourceId) || 'Bilinmeyen Tedarikçi'
                : batchMap.get(receipt.sourceId) || 'Bilinmeyen Parti',
            warehouseName: warehouseMap.get(receipt.warehouseId) || 'Bilinmeyen Depo',
        }));

        const filtered = searchTerm
            ? preparedData.filter(row => 
                row.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.warehouseName.toLowerCase().includes(searchTerm.toLowerCase())
              )
            : preparedData;

        const getSortableValue = (row: GoodsReceiptRow, key: string) => {
            if (key === 'receiptDate') return dayjs(row.receiptDate).valueOf();
            let value: any = row;
            const keys = key.split('.');
            for (const k of keys) { value = value?.[k]; }
            return value || '';
        };

        return [...filtered].sort((a, b) => {
            const aValue = getSortableValue(a, orderBy);
            const bValue = getSortableValue(b, orderBy);
            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }, [receiptsData, suppliersData, warehousesData, batchesData, searchTerm, order, orderBy]);
    
    const paginatedData = React.useMemo(() => {
      return sortedAndFilteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [sortedAndFilteredData, page, rowsPerPage]);

    const columns = React.useMemo<ColumnDef<GoodsReceiptRow>[]>(() => [
        { key: 'receiptNumber', header: 'Fiş/İrsaliye No', sortable: true, getValue: (row) => row.receiptNumber, render: (row) => row.receiptNumber },
        { key: 'sourceName', header: 'Kaynak (Tedarikçi/Parti)', sortable: true, getValue: (row) => row.sourceName, render: (row) => row.sourceName },
        { key: 'warehouseName', header: 'Depo', sortable: true, getValue: (row) => row.warehouseName, render: (row) => row.warehouseName },
        { key: 'totalValue', header: 'Toplam Tutar', sortable: true, getValue: (row) => row.totalValue, render: (row) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.totalValue) },
        { key: 'receiptDate', header: 'Giriş Tarihi', sortable: true, getValue: (row) => dayjs(row.receiptDate).valueOf(), render: (row) => dayjs(row.receiptDate).format('DD/MM/YYYY') },
        { key: 'status', header: 'Durum', sortable: true, getValue: (row) => row.status, render: (row) => <StatusChip status={row.status} /> },
        {
            key: 'actions',
            header: 'İşlemler',
            align: 'right',
            render: (row) => (
                <Stack direction="row" spacing={0} justifyContent="flex-end">
                    {canManageReceipts && row.status === 'COMPLETED' && (
                        <Tooltip title="Girişi İptal Et">
                            <IconButton size="small" color="error" onClick={() => handleCancelClick(row)}>
                                <CancelIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            ),
        },
    ], [canManageReceipts]);

    if (isLoading) return <Stack alignItems="center" justifyContent="center" sx={{minHeight: '80vh'}}><CircularProgress /></Stack>;
    if (error) return <Alert severity="error">{error.message}</Alert>;
    if (!canViewReceipts) return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;
    
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack spacing={3}>
            <AppBreadcrumbs />
            <PageHeader
                title="Mal Giriş Yönetimi"
                action={ canManageReceipts ? (
                    <Button startIcon={<PlusIcon />} variant="contained" onClick={() => setCreateFormOpen(prev => !prev)}>
                        Yeni Giriş Yap
                    </Button>
                ) : undefined }
            />

            <InlineCreateForm
                title="Yeni Mal Girişi Oluştur"
                isOpen={isCreateFormOpen}
                onClose={() => setCreateFormOpen(false)}
            >
                <GoodsReceiptCreateForm
                    onSuccess={(newReceipt) => handleSuccess("Mal girişi başarıyla oluşturuldu!", newReceipt)}
                    onCancel={() => setCreateFormOpen(false)}
                />
            </InlineCreateForm>
            
            <ActionableTable<GoodsReceiptRow>
                columns={columns}
                rows={paginatedData}
                count={sortedAndFilteredData.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); }}
                searchTerm={searchTerm}
                onSearch={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                order={order}
                orderBy={orderBy}
                onSort={handleRequestSort}
                entity="goods-receipts"
                selectionEnabled={false}
                highlightedId={newlyAddedReceiptId}
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
      </LocalizationProvider>
    );
}