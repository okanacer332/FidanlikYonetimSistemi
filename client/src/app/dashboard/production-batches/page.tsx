'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Stack, CircularProgress, Alert, IconButton, Tooltip, Button } from '@mui/material';
import { Plus as PlusIcon, Pencil as PencilIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';

import { useUser } from '@/hooks/use-user';
import type { ProductionBatch, PlantType, PlantVariety } from '@/types/nursery';
import { useApiSWR } from '@/hooks/use-api-swr';
import { useNotifier } from '@/hooks/useNotifier';

// --- ORTAK BİLEŞENLER ---
import { PageHeader } from '@/components/common/PageHeader';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { StatusChip } from '@/components/common/StatusChip'; // Düzeltilmiş bileşeni kullanıyoruz
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { InlineCreateForm } from '@/components/common/InlineCreateForm';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// --- MODÜLE ÖZEL FORM BİLEŞENLERİ ---
import { ProductionBatchCreateForm } from '@/components/dashboard/production-batches/production-batch-create-form';

export interface BatchRow extends ProductionBatch {
  plantTypeName: string;
  plantVarietyName: string;
}

const useProductionBatches = () => useApiSWR<ProductionBatch[]>('/production-batches');
const usePlantTypes = () => useApiSWR<PlantType[]>('/plant-types');
const usePlantVarieties = () => useApiSWR<PlantVariety[]>('/plant-varieties');

export default function Page(): React.JSX.Element {
    const router = useRouter();
    const notify = useNotifier();
    const { user: currentUser, isLoading: isUserLoading } = useUser();

    const { data: batchesData, error: batchesError, isLoading: isLoadingBatches, mutate: mutateBatches } = useProductionBatches();
    const { data: plantTypesData, error: plantTypesError, isLoading: isLoadingPlantTypes } = usePlantTypes();
    const { data: plantVarietiesData, error: plantVarietiesError, isLoading: isLoadingPlantVarieties } = usePlantVarieties();
    
    // ... (state'ler ve handle fonksiyonları aynı) ...
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [order, setOrder] = React.useState<'asc' | 'desc'>('desc');
    const [orderBy, setOrderBy] = React.useState<string>('startDate');
    const [newlyAddedBatchId, setNewlyAddedBatchId] = React.useState<string | null>(null);
    const [isCreateFormOpen, setCreateFormOpen] = React.useState(false);

    const isLoading = isLoadingBatches || isLoadingPlantTypes || isLoadingPlantVarieties || isUserLoading;
    const error = batchesError || plantTypesError || plantVarietiesError;

    const canManageBatches = currentUser?.roles?.some(role => role.name === 'ADMIN');
    const canViewBatches = currentUser?.roles?.some(role => ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'].includes(role.name));

    const handleSuccess = (message: string, newBatch: ProductionBatch) => {
        setCreateFormOpen(false);
        notify.success(message);
        setNewlyAddedBatchId(newBatch.id);
        setTimeout(() => setNewlyAddedBatchId(null), 2000);
        mutateBatches();
    };

    const handleEditClick = (batch: BatchRow) => {
        router.push(`/dashboard/production-batches/${batch.id}`);
    };
    
    const handleRequestSort = React.useCallback((property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    }, [order, orderBy]);
    const sortedAndFilteredData = React.useMemo((): BatchRow[] => {
        const batches = batchesData || [];
        const plantTypes = plantTypesData || [];
        const plantVarieties = plantVarietiesData || [];
        const typeMap = new Map(plantTypes.map(t => [t.id, t.name]));
        const varietyMap = new Map(plantVarieties.map(v => [v.id, v.name]));
        const preparedData: BatchRow[] = batches.map(batch => ({
            ...batch,
            plantTypeName: typeMap.get(batch.plantTypeId) || 'Bilinmiyor',
            plantVarietyName: varietyMap.get(batch.plantVarietyId) || 'Bilinmiyor',
        }));
        const filtered = searchTerm
            ? preparedData.filter(row => 
                row.batchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.plantTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.plantVarietyName.toLowerCase().includes(searchTerm.toLowerCase())
              )
            : preparedData;
        const getSortableValue = (row: BatchRow, key: string) => {
            if (key === 'startDate') return dayjs(row.startDate).valueOf();
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
    }, [batchesData, plantTypesData, plantVarietiesData, searchTerm, order, orderBy]);
    
    const paginatedData = React.useMemo(() => {
      return sortedAndFilteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [sortedAndFilteredData, page, rowsPerPage]);

    const columns = React.useMemo<ColumnDef<BatchRow>[]>(() => [
        { key: 'batchCode', header: 'Parti Kodu', sortable: true, getValue: (row) => row.batchCode, render: (row) => row.batchCode },
        { key: 'batchName', header: 'Parti Adı', sortable: true, getValue: (row) => row.batchName, render: (row) => row.batchName },
        { key: 'initialQuantity', header: 'Başlangıç Adedi', sortable: true, getValue: (row) => row.initialQuantity, render: (row) => row.initialQuantity },
        { key: 'startDate', header: 'Başlangıç Tarihi', sortable: true, getValue: (row) => dayjs(row.startDate).valueOf(), render: (row) => dayjs(row.startDate).format('DD/MM/YYYY') },
        { 
            key: 'status', 
            header: 'Durum', 
            sortable: true, 
            getValue: (row) => row.status, 
            render: (row) => <StatusChip status={row.status} /> // ARTIK DOĞRU KULLANIM
        },
        {
            key: 'actions',
            header: 'İşlemler',
            align: 'right',
            render: (row) => (
                <Stack direction="row" spacing={0} justifyContent="flex-end">
                    {canManageBatches && (
                        <Tooltip title="Partiyi Düzenle / Detayları Gör">
                            <IconButton size="small" onClick={() => handleEditClick(row)}>
                                <PencilIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            ),
        },
    ], [canManageBatches, router]);

    if (isLoading) return <Stack alignItems="center" justifyContent="center" sx={{minHeight: '80vh'}}><CircularProgress /></Stack>;
    if (error) return <Alert severity="error">{error.message}</Alert>;
    if (!canViewBatches) return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;
    
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack spacing={3}>
            <AppBreadcrumbs />
            <PageHeader
                title="Üretim Partileri"
                action={ canManageBatches ? (
                    <Button startIcon={<PlusIcon />} variant="contained" onClick={() => setCreateFormOpen(prev => !prev)}>
                        Yeni Parti Oluştur
                    </Button>
                ) : undefined }
            />

            <InlineCreateForm
                title="Yeni Üretim Partisi Oluştur"
                isOpen={isCreateFormOpen}
                onClose={() => setCreateFormOpen(false)}
            >
                <ProductionBatchCreateForm
                    onSuccess={(newBatch) => handleSuccess("Üretim partisi başarıyla oluşturuldu!", newBatch)}
                    onCancel={() => setCreateFormOpen(false)}
                    plantTypes={plantTypesData || []}
                    plantVarieties={plantVarietiesData || []}
                />
            </InlineCreateForm>
            
            <ActionableTable<BatchRow>
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
                entity="production-batches"
                selectionEnabled={false}
                highlightedId={newlyAddedBatchId}
            />
        </Stack>
      </LocalizationProvider>
    );
}