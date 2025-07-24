// client/src/api/stock.ts

import type { StockSummary } from '@/types/nursery'; // client/src/types/nursery.ts yerine @/types/nursery

// Ortam değişkeninden gelen temel API URL'si
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// API yanıtının yapısını tanımlayalım
interface GetStockSummaryResponse {
  data: StockSummary[];
}

/**
 * Backend'den tüm stok özet verilerini çeker.
 * @returns StockSummary[] içeren bir Promise
 */
export async function getStockSummary(): Promise<GetStockSummaryResponse> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Oturum bulunamadı.');
  }

  // Endpoint URL'sini API_BASE_URL ile birleştiriyoruz
  const url = `${API_BASE_URL}/stock/summary`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json', // GET isteği olsa da genelde eklenir
    },
  });

  if (!response.ok) {
    // Hata durumunda sunucudan gelen mesajı veya genel bir hata mesajı döndür
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API hatası: ${response.status} ${response.statusText}`);
    } catch (e) {
      throw new Error(`Stok özet verileri çekilirken bir hata oluştu: ${response.status} ${response.statusText}`);
    }
  }

  const data: StockSummary[] = await response.json();
  return { data };
}