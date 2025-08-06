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
export async function createProductionBatch(data: ProductionBatchCreatePayload): Promise<ProductionBatch> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found.');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/production-batches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Production batch could not be created.');
  }

  return responseData;
}