'use client';

import * as React from 'react';

import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Box,
  Button,
} from '@mui/material';
import { getAllProductionBatches } from '@/api/nursery';
import type { ProductionBatch, PlantType, PlantVariety } from '@/types/plant';
import { useApi } from '@/hooks/use-api';

// Yeni bir interface tanımlayalım ProductionBatchesTable için prop'ları belirtmek üzere
interface ProductionBatchesTableProps {
  productionBatches: ProductionBatch[];
  plantTypeMap: Map<string, string>;
  plantVarietyMap: Map<string, string>;
  // isLoading ve error durumları artık page.tsx tarafından yönetildiği için burada kaldırıldı
}

export function ProductionBatchesTable({ productionBatches: batches, plantTypeMap, plantVarietyMap }: ProductionBatchesTableProps): React.JSX.Element {
  // productionBatches, plantTypeMap, plantVarietyMap artık prop olarak geliyor, bu component kendi içinde veri çekmiyor.
  // Bu nedenle aşağıdaki state ve useEffect hook'ları kaldırıldı.
  // const [productionBatches, setProductionBatches] = React.useState<ProductionBatch[]>([]);
  // const [isLoadingBatches, setIsLoadingBatches] = React.useState<boolean>(true);
  // const [batchesError, setBatchesError] = React.useState<Error | null>(null);

  // const { data: plantTypes, isLoading: isLoadingPlantTypes, error: plantTypesError } = useApi<PlantType[]>('/api/v1/plant-types');
  // const { data: plantVarieties, isLoading: isLoadingPlantVarieties, error: plantVarietiesError } = useApi<PlantVariety[]>('/api/v1/plant-varieties');

  // React.useEffect(() => {
  //   const fetchBatches = async () => {
  //     setIsLoadingBatches(true);
  //     setBatchesError(null);
  //     try {
  //       const data = await getAllProductionBatches();
  //       setProductionBatches(data);
  //     } catch (err) {
  //       setBatchesError(err instanceof Error ? err : new Error('Üretim partileri yüklenirken bilinmeyen bir hata oluştu.'));
  //     } finally {
  //       setIsLoadingBatches(false);
  //     }
  //   };

  //   void fetchBatches();
  // }, []);

  // plantTypeMap ve plantVarietyMap de prop olarak geldiği için useMemo'ya gerek kalmadı
  // const plantTypeMap = React.useMemo(() => {
  //   return plantTypes?.reduce((map, type) => {
  //     map.set(type.id, type.name);
  //     return map;
  //   }, new Map<string, string>()) || new Map<string, string>();
  // }, [plantTypes]);

  // const plantVarietyMap = React.useMemo(() => {
  //   return plantVarieties?.reduce((map, variety) => {
  //     map.set(variety.id, variety.name);
  //     return map;
  //   }, new Map<string, string>()) || new Map<string, string>();
  // }, [plantVarieties]);

  // Yükleme ve hata durumları page.tsx tarafından yönetildiği için burada kontrol etmiyoruz
  // const isLoading = isLoadingBatches || isLoadingPlantTypes || isLoadingPlantVarieties;
  // const error = batchesError || plantTypesError || plantVarietiesError;

  // if (isLoading) {
  //   return (
  //     <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  // if (error) {
  //   return (
  //     <Box sx={{ p: 3, textAlign: 'center' }}>
  //       <Typography color="error">Veriler yüklenirken bir hata oluştu: {error.message}</Typography>
  //       <Typography variant="body2" color="text.secondary">Lütfen ağ bağlantınızı kontrol edin veya daha sonra tekrar deneyin.</Typography>
  //     </Box>
  //   );
  // }

  // batches artık prop olarak geliyor
  // const batches = productionBatches; 

  return (
    <Card>
      <Box sx={{ minWidth: 800, overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Parti Kodu</TableCell>
                <TableCell>Parti Adı</TableCell>
                <TableCell>Fidan Türü</TableCell>
                <TableCell>Fidan Çeşidi</TableCell>
                <TableCell>Başlangıç Tarihi</TableCell>
                <TableCell>Başlangıç Adedi</TableCell>
                <TableCell>Mevcut Adet</TableCell>
                <TableCell>Hasat Edilen Adet</TableCell>
                <TableCell>Maliyet Havuzu (Nominal)</TableCell>
                <TableCell>Maliyet Havuzu (Enf. Düz.)</TableCell>
                <TableCell>Son Maliyet Güncelleme</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Açıklama</TableCell>
                <TableCell>Aksiyonlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batches.map((batch) => (
                <TableRow hover key={batch.id}> {/* Burada boşluk sorunu çözüldü */}
                  <TableCell>{batch.batchCode}</TableCell>
                  <TableCell>{batch.batchName}</TableCell>
                  <TableCell>{plantTypeMap.get(batch.plantTypeId) || 'Bilinmiyor'}</TableCell>
                  <TableCell>{plantVarietyMap.get(batch.plantVarietyId) || 'Bilinmiyor'}</TableCell>
                  <TableCell>{new Date(batch.startDate).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>{batch.initialQuantity}</TableCell>
                  <TableCell>{batch.currentQuantity}</TableCell>
                  <TableCell>{batch.harvestedQuantity ?? '0'}</TableCell>
                  <TableCell>{batch.costPool?.toFixed(2) ?? '0.00'}</TableCell>
                  <TableCell>{batch.inflationAdjustedCostPool?.toFixed(2) ?? '0.00'}</TableCell>
                  <TableCell>{batch.lastCostUpdateDate ? new Date(batch.lastCostUpdateDate).toLocaleDateString('tr-TR') : 'N/A'}</TableCell>
                  <TableCell>{batch.status}</TableCell>
                  <TableCell>{batch.description || 'N/A'}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined">Detay</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
    </Card>
  );
}