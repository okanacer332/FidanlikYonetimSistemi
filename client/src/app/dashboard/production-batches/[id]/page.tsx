'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Stack, Typography, CircularProgress, Box, Card, CardContent, CardHeader, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Alert } from '@mui/material';
import { ArrowLeft as ArrowBackIcon, Plus as PlusIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';

import { useApiSWR } from '@/hooks/use-api-swr';
import { useNotifier } from '@/hooks/useNotifier';
import { useUser } from '@/hooks/use-user';
import type { ProductionBatch, PlantType, PlantVariety, Expense } from '@/types/nursery';

// --- Ortak Bileşenler ---
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/common/StatusChip';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// --- Modüle Özel Bileşenler ---
import { AddExpenseForm } from '@/components/dashboard/production-batch/add-expense-form';


export default function ProductionBatchDetailPage(): React.JSX.Element {
  const { id } = useParams();
  const router = useRouter();
  const notify = useNotifier();
  const { user: currentUser } = useUser();

  const batchId = typeof id === 'string' ? id : null;

  const { data: batch, error: batchError, isLoading: isLoadingBatch, mutate: mutateBatch } = useApiSWR<ProductionBatch>(batchId ? `/production-batches/${batchId}` : null);
  const { data: expenses, error: expensesError, isLoading: isLoadingExpenses, mutate: mutateExpenses } = useApiSWR<Expense[]>(batchId ? `/expenses/by-batch/${batchId}` : null);
  const { data: plantTypes, error: plantTypesError, isLoading: isLoadingPlantTypes } = useApiSWR<PlantType[]>('/plant-types');
  const { data: plantVarieties, error: plantVarietiesError, isLoading: isLoadingPlantVarieties } = useApiSWR<PlantVariety[]>('/plant-varieties');
  
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [isAddExpenseFormOpen, setIsAddExpenseFormOpen] = React.useState(false); // Gider formu için state

  const isLoading = isLoadingBatch || isLoadingExpenses || isLoadingPlantTypes || isLoadingPlantVarieties;
  const error = batchError || expensesError || plantTypesError || plantVarietiesError;
  
  const canManageBatches = currentUser?.roles?.some(role => role.name === 'ADMIN');

  const plantTypeMap = React.useMemo(() => new Map(plantTypes?.map(t => [t.id, t.name])), [plantTypes]);
  const plantVarietyMap = React.useMemo(() => new Map(plantVarieties?.map(v => [v.id, v.name])), [plantVarieties]);

  const handleAddExpenseSuccess = () => {
    setIsAddExpenseFormOpen(false);
    notify.success("Gider başarıyla eklendi!");
    mutateBatch(); // Parti maliyetini yenile
    mutateExpenses(); // Gider tablosunu yenile
  };

  const handleCancelBatch = async () => {
    if (!batchId) return;
    try {
        const token = localStorage.getItem('authToken');
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/production-batches/${batchId}/cancel`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        notify.success('Parti başarıyla iptal edildi!');
        mutateBatch();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Parti iptal edilirken bir hata oluştu.');
    } finally {
      setIsCancelDialogOpen(false);
    }
  };
  
  const expenseColumns = React.useMemo<ColumnDef<Expense>[]>(() => [
    { key: 'description', header: 'Açıklama', render: (row) => row.description },
    { key: 'category.name', header: 'Kategori', render: (row) => row.category?.name || 'N/A' },
    { key: 'amount', header: 'Tutar', render: (row) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.amount) },
    { key: 'expenseDate', header: 'Tarih', render: (row) => dayjs(row.expenseDate).format('DD/MM/YYYY') },
  ], []);

  if (isLoading) return <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}><CircularProgress /></Stack>;
  if (error) return <Alert severity="error" sx={{m:3}}>{error.message}</Alert>;
  if (!batch) return <Alert severity="warning" sx={{m:3}}>Üretim partisi bulunamadı.</Alert>;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack spacing={3}>
        <AppBreadcrumbs />
        <PageHeader
            title={`Parti Detayı: ${batch.batchName}`}
            action={
            <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => router.push('/dashboard/production-batches')}>
                Listeye Geri Dön
            </Button>
            }
        />
        
        <Grid container spacing={3}>
            {/* ... Diğer Grid'ler aynı kalacak ... */}
            <Grid size={{ xs: 12, lg: 4 }}>
                <Card>
                    <CardHeader title="Genel Bilgiler" />
                    <CardContent><Stack spacing={2}><Typography variant="body1"><strong>Parti Kodu:</strong> {batch.batchCode}</Typography><Typography variant="body1"><strong>Fidan:</strong> {plantTypeMap.get(batch.plantTypeId)} - {plantVarietyMap.get(batch.plantVarietyId)}</Typography><Typography variant="body1" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <strong>Durum:</strong>
  <StatusChip status={batch.status} />
</Typography><Typography variant="body1"><strong>Başlangıç Tarihi:</strong> {dayjs(batch.startDate).format('DD/MM/YYYY')}</Typography></Stack></CardContent>
                </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
                <Card>
                    <CardHeader title="Adet Bilgileri" />
                    <CardContent><Stack spacing={2}><Typography variant="body1"><strong>Başlangıç Adedi:</strong> {batch.initialQuantity}</Typography><Typography variant="body1"><strong>Mevcut Adet:</strong> {batch.currentQuantity}</Typography><Typography variant="body1"><strong>Hasat Edilen:</strong> {batch.harvestedQuantity || 0}</Typography><Typography variant="body1"><strong>Beklenen Hasat:</strong> {batch.expectedHarvestQuantity || 'Belirtilmemiş'}</Typography></Stack></CardContent>
                </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
                <Card>
                    <CardHeader title="Maliyet Bilgileri" />
                    <CardContent><Stack spacing={2}><Typography variant="body1"><strong>Maliyet Havuzu:</strong> {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(batch.costPool)}</Typography><Typography variant="body1"><strong>Enf. Düzeltilmiş:</strong> {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(batch.inflationAdjustedCostPool || 0)}</Typography><Typography variant="body1"><strong>Son Güncelleme:</strong> {batch.lastCostUpdateDate ? dayjs(batch.lastCostUpdateDate).format('DD/MM/YYYY') : 'N/A'}</Typography></Stack></CardContent>
                </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardHeader 
                        title="Partiye Ait Giderler"
                        action={
                            canManageBatches ? <Button startIcon={<PlusIcon/>} variant="contained" onClick={() => setIsAddExpenseFormOpen(true)}>Gider Ekle</Button> : null
                        }
                    />
                    <CardContent>
                    <ActionableTable<Expense>
                  columns={expenseColumns}
                  rows={expenses || []}
                  entity="expenses"
                  selectionEnabled={false} count={0} page={0} rowsPerPage={0} onPageChange={function (event: unknown, newPage: number): void {
                    throw new Error('Function not implemented.');
                  } } onRowsPerPageChange={function (event: React.ChangeEvent<HTMLInputElement>): void {
                    throw new Error('Function not implemented.');
                  } }                        // Bu tablo için sayfalama vs. şimdilik gerekli değil
                    />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>

        <AddExpenseForm
            open={isAddExpenseFormOpen}
            onClose={() => setIsAddExpenseFormOpen(false)}
            onSuccess={handleAddExpenseSuccess}
            productionBatchId={batch.id}
        />

        <Dialog open={isCancelDialogOpen} onClose={() => setIsCancelDialogOpen(false)}>
            {/* ... (Cancel Dialog aynı kalacak) ... */}
            <DialogTitle>Partiyi İptal Etmeyi Onayla</DialogTitle>
            <DialogContent><DialogContentText>Bu üretim partisini iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.</DialogContentText></DialogContent>
            <DialogActions><Button onClick={() => setIsCancelDialogOpen(false)}>Vazgeç</Button><Button onClick={handleCancelBatch} color="error">Evet, İptal Et</Button></DialogActions>
        </Dialog>
        </Stack>
    </LocalizationProvider>
  );
}