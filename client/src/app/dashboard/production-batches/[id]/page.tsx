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

import { useApi } from '@/hooks/use-api';
import type { ProductionBatch, PlantType, PlantVariety, Plant } from '@/types/plant';
import dayjs from 'dayjs';
import { HarvestForm } from '@/components/dashboard/production-batches/harvest-form';

export default function ProductionBatchDetailPage(): React.JSX.Element {
  const { id } = useParams();
  const router = useRouter();

  const batchId = typeof id === 'string' ? id : null;

  // Üretim partisi detayını ve refetch fonksiyonunu alıyoruz
  const { data: productionBatch, isLoading, error, refetch } = useApi<ProductionBatch>(batchId ? `/api/v1/production-batches/${batchId}` : null);

  // Fidan Türleri ve Çeşitleri için veri çekme
  const { data: plantTypes, isLoading: isLoadingPlantTypes, error: plantTypesError } = useApi<PlantType[]>('/api/v1/plant-types');
  const { data: plantVarieties, isLoading: isLoadingPlantVarieties, error: plantVarietiesError } = useApi<PlantVariety[]>('/api/v1/plant-varieties');
  
  // YENİ: ProductionBatch'teki plantTypeId ve plantVarietyId'yi kullanarak doğru Plant ID'sini çekme
  const { data: plant, isLoading: isLoadingPlant, error: plantError } = useApi<Plant>(
    productionBatch?.plantTypeId && productionBatch?.plantVarietyId 
      ? `/api/v1/plants/by-type-and-variety?plantTypeId=${productionBatch.plantTypeId}&plantVarietyId=${productionBatch.plantVarietyId}` 
      : null
  );

  const [isHarvestFormOpen, setIsHarvestFormOpen] = React.useState<boolean>(false);

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

  // Yeni isLoading ve error durumları eklendi
  const overallLoading = isLoading || isLoadingPlantTypes || isLoadingPlantVarieties || isLoadingPlant;
  const overallError = error || plantTypesError || plantVarietiesError || plantError;

  const handleHarvestSuccess = React.useCallback(() => {
    setIsHarvestFormOpen(false);
    void refetch();
    toast.success('Hasat başarıyla kaydedildi!');
  }, [refetch]);


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

  // plant objesi yoksa da bir hata mesajı gösterelim
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
            <Button variant="contained" onClick={() => setIsHarvestFormOpen(true)}>
              Hasat Yap
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <HarvestForm
        open={isHarvestFormOpen}
        onClose={() => setIsHarvestFormOpen(false)}
        onSuccess={handleHarvestSuccess}
        productionBatchId={productionBatch.id}
        plantId={plant.id} // Doğru Plant ID'si HarvestForm'a iletiliyor
        currentBatchQuantity={productionBatch.currentQuantity}
      />
    </Stack>
  );
}