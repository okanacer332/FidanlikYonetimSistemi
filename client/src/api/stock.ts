// client/src/api/stock.ts
import type { Stock, StockSummary, Plant, Warehouse } from '@/types/nursery';

// Projendeki merkezi API URL'sini .env dosyasından alıyoruz
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const fetchData = async <T>(url: string): Promise<T> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `Veri alınamadı: ${response.status}`);
    } catch (e) {
      throw new Error(`Veri alınamadı: ${response.status}`);
    }
  }
  
  return response.json();
};


// 1. Ham stok listesini çeken fonksiyon
export const getStocks = async (): Promise<Stock[]> => {
  const url = `${API_BASE_URL}/api/v1/stock`;
  return fetchData<Stock[]>(url);
};

// 2. Tüm fidan bilgilerini çeken fonksiyon
export const getPlants = async (): Promise<Plant[]> => {
    const url = `${API_BASE_URL}/api/v1/plants`;
    return fetchData<Plant[]>(url);
};

// 3. Tüm depo bilgilerini çeken fonksiyon
export const getWarehouses = async (): Promise<Warehouse[]> => {
    const url = `${API_BASE_URL}/api/v1/warehouses`;
    return fetchData<Warehouse[]>(url);
};

// getStockSummary fonksiyonuna artık ihtiyacımız kalmadı, istersen silebilirsin.
