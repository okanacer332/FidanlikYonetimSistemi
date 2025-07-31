'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-hot-toast';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

import { useApi } from '@/hooks/use-api';
import type { ProductionBatch, PlantType, PlantVariety, Plant } from '@/types/plant';
import type { Expense, ExpenseCategory } from '@/types/expense';
import dayjs from 'dayjs';
import { HarvestForm } from '@/components/dashboard/production-batches/harvest-form';
import { AddExpenseForm } from '@/components/dashboard/production-batches/add-expense-form';
import { completeProductionBatch, cancelProductionBatch } from '@/api/nursery';
import { BatchExpensesTable } from '@/components/dashboard/production-batches/batch-expenses-table';
import { getExpenseCategories } from '@/api/expense';

export default function ProductionBatchDetailPage(): React.JSX.Element {
  const { id } = useParams();
  const router = useRouter();

  const batchId = typeof id === 'string' ? id : null;

  const { data: productionBatch, isLoading, error, refetch } = useApi<ProductionBatch>(batchId ? `/api/v1/production-batches/${batchId}` : null);
  const { data: plantTypes, isLoading: isLoadingPlantTypes, error: plantTypesError } = useApi<PlantType[]>('/api/v1/plant-types');
  const { data: plantVarieties, isLoading: isLoadingPlantVarieties, error: plantVarietiesError } = useApi<PlantVariety[]>('/api/v1/plant-varieties');
  const { data: plant, isLoading: isLoadingPlant, error: plantError } = useApi<Plant>(
    productionBatch?.plantTypeId && productionBatch?.plantVarietyId 
      ? `/api/v1/plants/by-type-and-variety?plantTypeId=${productionBatch.plantTypeId}&plantVarietyId=${productionBatch.plantVarietyId}` 
      : null
  );
  // YENİ: Giderler için ayrı bir refetch fonksiyonu eklendi
  const { data: batchExpenses, isLoading: isLoadingExpenses, error: expensesError, refetch: refetchExpenses } = useApi<Expense[]>(
    batchId ? `/api/v1/expenses/by-batch/${batchId}` : null
  );
  const { data: expenseCategories, isLoading: isLoadingCategories, error: categoriesError } = useApi<ExpenseCategory[]>('/api/v1/expense-categories');


  const [isHarvestFormOpen, setIsHarvestFormOpen] = React.useState<boolean>(false);
  const [isAddExpenseFormOpen, setIsAddExpenseFormOpen] = React.useState<boolean>(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = React.useState<boolean>(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState<boolean>(false);

  const plantTypeMap = React.useMemo(() => {
    return plantTypes?.reduce((map, type) => {
      map.set(type.id, type.name);
      return map;
    }, new Map<string, string>()) || new Map<string, string>();
  }, [plantTypes]);

  const plantVarietyMap = React.useMemo(() => {
    return plantVarieties?.reduce((map, variety) => {
      map.set(variety.id, variety.name);
      return map;
    }, new Map<string, string>()) || new Map<string, string>();
  }, [plantVarieties]);
  
  const expenseCategoriesMap = React.useMemo(() => {
    return expenseCategories?.reduce((map, category) => {
      map.set(category.id, category);
      return map;
    }, new Map<string, ExpenseCategory>()) || new Map<string, ExpenseCategory>();
  }, [expenseCategories]);


  const overallLoading = isLoading || isLoadingPlantTypes || isLoadingPlantVarieties || isLoadingPlant || isLoadingExpenses || isLoadingCategories;
  const overallError = error || plantTypesError || plantVarietiesError || plantError || expensesError || categoriesError;

  const handleHarvestSuccess = React.useCallback(() => {
    setIsHarvestFormOpen(false);
    void refetch();
    toast.success('Hasat başarıyla kaydedildi!');
  }, [refetch]);

  // DEĞİŞİKLİK: Gider eklendiğinde hem parti verilerini hem de gider listesini yenile
  const handleAddExpenseSuccess = React.useCallback(() => {
    setIsAddExpenseFormOpen(false);
    void refetch(); // Parti verilerini yenile (maliyet havuzu için)
    void refetchExpenses(); // Gider listesini yenile
    toast.success('Gider başarıyla eklendi!');
  }, [refetch, refetchExpenses]);

  const handleCompleteBatch = React.useCallback(async () => {
    if (!batchId) return;
    try {
      await completeProductionBatch(batchId);
      toast.success('Parti başarıyla tamamlandı!');
      void refetch();
    } catch (err) {
      console.error('Partiyi tamamlarken hata oluştu:', err);
      toast.error('Partiyi tamamlarken bir hata oluştu.');
    } finally {
      setIsCompleteDialogOpen(false);
    }
  }, [batchId, refetch]);

  const handleCancelBatch = React.useCallback(async () => {
    if (!batchId) return;
    try {
      await cancelProductionBatch(batchId);
      toast.success('Parti başarıyla iptal edildi!');
      void refetch();
    } catch (err) {
      console.error('Partiyi iptal ederken hata oluştu:', err);
      toast.error('Partiyi iptal ederken bir hata oluştu.');
    } finally {
      setIsCancelDialogOpen(false);
    }
  }, [batchId, refetch]);


  if (overallLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (overallError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Detaylar yüklenirken bir hata oluştu: {overallError.message}</Typography>
        <Typography variant="body2" color="text.secondary">Lütfen ağ bağlantınızı kontrol edin veya daha sonra tekrar deneyin.</Typography>
      </Box>
    );
  }

  if (!productionBatch) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Üretim Partisi bulunamadı veya geçersiz ID.</Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => router.back()}>
          Geri Dön
        </Button>
      </Box>
    );
  }

  if (!plant) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Bu üretim partisi için eşleşen bir fidan kimliği bulunamadı.</Typography>
        <Typography variant="body2" color="text.secondary">Lütfen fidan yönetiminden bu fidan kimliğini oluşturun.</Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => router.back()}>
          Geri Dön
        </Button>
      </Box>
    );
  }

  const canHarvestOrAddExpense = productionBatch.status === 'CREATED' || productionBatch.status === 'GROWING' || productionBatch.status === 'HARVESTED';

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }} spacing={3}>
        <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => router.back()}>
          Listeye Geri Dön
        </Button>
        <Typography variant="h4">Parti Detayı: {productionBatch.batchCode}</Typography>
      </Stack>

      <Card>
        <CardHeader title="Genel Bilgiler" />
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="body1">
              <strong>Parti Adı:</strong> {productionBatch.batchName}
            </Typography>
            <Typography variant="body1">
              <strong>Parti Kodu:</strong> {productionBatch.batchCode}
            </Typography>
            <Typography variant="body1">
              <strong>Fidan Türü:</strong> {plantTypeMap.get(productionBatch.plantTypeId) || 'Bilinmiyor'}
            </Typography>
            <Typography variant="body1">
              <strong>Fidan Çeşidi:</strong> {plantVarietyMap.get(productionBatch.plantVarietyId) || 'Bilinmiyor'}
            </Typography>
            <Typography variant="body1">
              <strong>Başlangıç Tarihi:</strong> {dayjs(productionBatch.startDate).format('DD/MM/YYYY')}
            </Typography>
            <Typography variant="body1">
              <strong>Başlangıç Adedi:</strong> {productionBatch.initialQuantity}
            </Typography>
            <Typography variant="body1">
              <strong>Mevcut Adet:</strong> {productionBatch.currentQuantity}
            </Typography>
            <Typography variant="body1">
              <strong>Beklenen Hasat Adedi:</strong> {productionBatch.expectedHarvestQuantity ?? 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Hasat Edilen Adet:</strong> {productionBatch.harvestedQuantity ?? '0'}
            </Typography>
            <Typography variant="body1">
              <strong>Durum:</strong> {productionBatch.status}
            </Typography>
            <Typography variant="body1">
              <strong>Açıklama:</strong> {productionBatch.description || 'N/A'}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Maliyet ve Finansal Bilgiler" />
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="body1">
              <strong>Maliyet Havuzu (Nominal):</strong> {productionBatch.costPool?.toFixed(2) ?? '0.00'}
            </Typography>
            <Typography variant="body1">
              <strong>Maliyet Havuzu (Enf. Düz.):</strong> {productionBatch.inflationAdjustedCostPool?.toFixed(2) ?? '0.00'}
            </Typography>
            <Typography variant="body1">
              <strong>Son Maliyet Güncelleme:</strong> {productionBatch.lastCostUpdateDate ? dayjs(productionBatch.lastCostUpdateDate).format('DD/MM/YYYY') : 'N/A'}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Parti Aksiyonları" />
        <CardContent>
          <Stack direction="row" spacing={2}>
            {canHarvestOrAddExpense && (
              <Button variant="contained" onClick={() => setIsHarvestFormOpen(true)}>
                Hasat Yap
              </Button>
            )}
            {canHarvestOrAddExpense && (
              <Button variant="outlined" onClick={() => setIsAddExpenseFormOpen(true)}>
                Gider Ekle
              </Button>
            )}
            {productionBatch.status !== 'COMPLETED' && productionBatch.status !== 'CANCELLED' && (
              <Button color="success" variant="outlined" onClick={() => setIsCompleteDialogOpen(true)}>
                Partiyi Tamamla
              </Button>
            )}
            {productionBatch.status !== 'COMPLETED' && productionBatch.status !== 'CANCELLED' && (
              <Button color="error" variant="outlined" onClick={() => setIsCancelDialogOpen(true)}>
                Partiyi İptal Et
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader title="Partiye Ait Giderler" />
        <CardContent>
          <BatchExpensesTable 
            expenses={batchExpenses || []} 
            expenseCategoriesMap={expenseCategoriesMap} 
          />
        </CardContent>
      </Card>

      <HarvestForm
        open={isHarvestFormOpen}
        onClose={() => setIsHarvestFormOpen(false)}
        onSuccess={handleHarvestSuccess}
        productionBatchId={productionBatch.id}
        plant={plant}
        currentBatchQuantity={productionBatch.currentQuantity}
      />

      <AddExpenseForm
        open={isAddExpenseFormOpen}
        onClose={() => setIsAddExpenseFormOpen(false)}
        onSuccess={handleAddExpenseSuccess}
        productionBatchId={productionBatch.id}
      />

      <Dialog open={isCompleteDialogOpen} onClose={() => setIsCompleteDialogOpen(false)}>
        <DialogTitle>Partiyi Tamamlamayı Onayla</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu üretim partisini tamamlamak istediğinize emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCompleteDialogOpen(false)}>İptal</Button>
          <Button onClick={handleCompleteBatch} color="success" autoFocus>
            Onayla
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isCancelDialogOpen} onClose={() => setIsCancelDialogOpen(false)}>
        <DialogTitle>Partiyi İptal Etmeyi Onayla</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu üretim partisini iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz ve partideki tüm fidanlar stoktan düşülür.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCancelDialogOpen(false)}>İptal</Button>
          <Button onClick={handleCancelBatch} color="error" autoFocus>
            Onayla
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}