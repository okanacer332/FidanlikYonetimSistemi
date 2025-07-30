// client/src/api/nursery.ts

import type { PlantType, PlantVariety, ProductionBatch } from '@/types/plant';
// useApi hook'unu burada doğrudan kullanmıyoruz ancak API_BASE_URL tanımı için referans alıyoruz

// API Base URL'sini tanımlıyoruz, process.env.NEXT_PUBLIC_API_URL undefined ise fallback kullanır
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Yeni bir üretim partisi oluşturmak için API çağrısı
interface CreateProductionBatchRequest {
  batchCode: string;
  batchName: string;
  startDate: string; // ISO string formatında
  initialQuantity: number;
  expectedHarvestQuantity?: number | null;
  description?: string | null;
  plantTypeId: string;
  plantVarietyId: string;
}

export const createProductionBatch = async (
  data: CreateProductionBatchRequest
): Promise<ProductionBatch> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
  }

  // API_BASE_URL kullanılarak tam URL oluşturuldu
  const response = await fetch(`${API_BASE_URL}/api/v1/production-batches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Üretim partisi oluşturulurken bir hata oluştu: ${response.status}`);
  }

  return response.json();
};

// Mevcut tüm üretim partilerini getiren fonksiyon (ProductionBatchesTable için)
export const getAllProductionBatches = async (): Promise<ProductionBatch[]> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
  }

  // API_BASE_URL kullanılarak tam URL oluşturuldu
  const response = await fetch(`${API_BASE_URL}/api/v1/production-batches`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // Hata durumunda JSON parse etmeyi dene, yoksa genel bir hata mesajı döndür
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `Üretim partileri alınamadı: ${response.status}`);
    } catch (e) {
      // Eğer yanıt JSON değilse (örn: HTML hata sayfası)
      if (response.status === 404) {
        throw new Error(`API Endpoint bulunamadı: ${API_BASE_URL}/api/v1/production-batches. Lütfen backend'in çalıştığından emin olun.`);
      }
      throw new Error(`Veri alınamadı: ${response.status}. Yanıt JSON formatında değil.`);
    }
  }

  return response.json();
};

// Plant Type API Fonksiyonları (sadece örnek amacıyla tutuluyor, useApi hook'u doğrudan kullanılabilir)
export const getPlantTypes = async (): Promise<PlantType[]> => {
  // Bu fonksiyon doğrudan kullanılmıyorsa, useApi tarafından çekiliyor olmalı.
  // Burada tekrar API_BASE_URL'i kullanmalıyız eğer bu fonksiyonlar direkt çağrılacaksa.
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/api/v1/plant-types`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Fidan türleri alınamadı: ${response.status}`);
  return response.json();
};

// Plant Variety API Fonksiyonları (sadece örnek amacıyla tutuluyor)
export const getPlantVarieties = async (): Promise<PlantVariety[]> => {
  // Bu fonksiyon doğrudan kullanılmıyorsa, useApi tarafından çekiliyor olmalı.
  // Burada tekrar API_BASE_URL'i kullanmalıyız eğer bu fonksiyonlar direkt çağrılacaksa.
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/api/v1/plant-varieties`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Fidan çeşitleri alınamadı: ${response.status}`);
  return response.json();
};