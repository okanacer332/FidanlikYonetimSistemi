'use client';

import * as React from 'react';
import type { Metadata } from 'next'; // Metadata import'ı artık sadece tipi için
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CircularProgress, Box } from '@mui/material';
import { toast } from 'react-hot-toast'; // toast import edildi

import { config } from '@/config';
import { ProductionBatchesTable } from '@/components/dashboard/production-batches/production-batches-table';
import { ProductionBatchCreateForm } from '@/components/dashboard/production-batches/production-batch-create-form';
import { Button } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Card } from '@mui/material';
import { CardHeader } from '@mui/material';
import { CardContent } from '@mui/material';

import { getAllProductionBatches } from '@/api/nursery';
import type { ProductionBatch, PlantType, PlantVariety } from '@/types/plant';
import { useApi } from '@/hooks/use-api';

export default function ProductionBatchesPage(): React.JSX.Element {
  // Tüm state ve hook tanımlamaları en başta ve koşulsuz olmalı
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState<boolean>(false);

  // Üretim Partileri için veri çekme state'leri
  const [productionBatches, setProductionBatches] = React.useState<ProductionBatch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = React.useState<boolean>(true);
  const [batchesError, setBatchesError] = React.useState<Error | null>(null);

  // Fidan Türleri ve Çeşitleri için veri çekme (Form ve Tablo için ortak)
  const { data: plantTypes, isLoading: isLoadingPlantTypes, error: plantTypesError } = useApi<PlantType[]>('/api/v1/plant-types');
  const { data: plantVarieties, isLoading: isLoadingPlantVarieties, error: plantVarietiesError } = useApi<PlantVariety[]>('/api/v1/plant-varieties');

  // Fidan Türü ve Çeşitleri için ID'den isme hızlı erişim map'leri
  // Hooks kuralına uygun olarak tüm koşullu render'lardan önce tanımlandı
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

  // Veri çekme fonksiyonu
  const fetchAllProductionBatches = React.useCallback(async () => {
    setIsLoadingBatches(true);
    setBatchesError(null);
    try {
      const data = await getAllProductionBatches();
      setProductionBatches(data);
    } catch (err) {
      setBatchesError(err instanceof Error ? err : new Error('Üretim partileri yüklenirken bilinmeyen bir hata oluştu.'));
    } finally {
      setIsLoadingBatches(false);
    }
  }, []);

  // Sayfa yüklendiğinde ve form başarıyla gönderildiğinde veriyi çek
  React.useEffect(() => {
    void fetchAllProductionBatches();
  }, [fetchAllProductionBatches]);

  const handleCreateFormToggle = () => {
    setIsCreateFormOpen((prev) => !prev);
  };

  // Yeni parti başarıyla oluşturulduğunda
  const handleProductionBatchCreated = () => {
    setIsCreateFormOpen(false); // Formu kapat
    void fetchAllProductionBatches(); // Tabloyu yenilemek için veriyi tekrar çek
    toast.success('Yeni üretim partisi başarıyla oluşturuldu ve liste güncellendi!');
  };

  // Genel yükleme ve hata durumunu kontrol et
  const isLoading = isLoadingBatches || isLoadingPlantTypes || isLoadingPlantVarieties;
  const error = batchesError || plantTypesError || plantVarietiesError;

  // Yükleme veya hata durumunda koşullu render
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Veriler yüklenirken bir hata oluştu: {error.message}</Typography>
        <Typography variant="body2" color="text.secondary">Lütfen ağ bağlantınızı kontrol edin veya daha sonra tekrar deneyin.</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4">Üretim Partileri</Typography>
        </Stack>
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleCreateFormToggle}>
            Yeni Parti Oluştur
          </Button>
        </div>
      </Stack>
      {isCreateFormOpen && (
        <Card>
          <CardHeader title="Yeni Üretim Partisi Oluştur" />
          <CardContent>
            <ProductionBatchCreateForm
              onClose={handleCreateFormToggle}
              onSuccess={handleProductionBatchCreated}
              plantTypes={plantTypes || []}
              plantVarieties={plantVarieties || []}
            />
          </CardContent>
        </Card>
      )}
      <ProductionBatchesTable
        productionBatches={productionBatches}
        plantTypeMap={plantTypeMap}
        plantVarietyMap={plantVarietyMap}
      />
    </Stack>
  );
}