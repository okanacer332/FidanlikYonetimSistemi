import { apiClient } from '@/lib/apiClient'; // <-- 1. YENİ İSTEMCİYİ IMPORT ET
import type { ProductionBatch } from '@/types/nursery';

// Formdan gelen ve sadece gerekli alanları içeren tip
export type ProductionBatchCreatePayload = {
  batchCode: string;
  batchName: string;
  startDate: string; // ISO Date String
  initialQuantity: number;
  plantTypeId: string;
  plantVarietyId: string;
};

// Yeni bir üretim partisi oluşturmak için API isteği
export const createProductionBatch = (data: ProductionBatchCreatePayload): Promise<ProductionBatch> => {
  // 2. karmaşık fetch kodunu, tek satırlık apiClient çağrısıyla değiştiriyoruz.
  return apiClient.post<ProductionBatch>('/production-batches', data);
}