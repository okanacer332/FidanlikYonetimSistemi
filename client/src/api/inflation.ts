import { format } from 'date-fns';
import type { InflationData } from '@/types/inflation';

// Ortam değişkeninden gelen temel URL. (Örn: http://localhost:8081/api/v1)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Belirtilen tarih aralığı için TCMB'den enflasyon verilerini çekip veritabanına kaydeder.
 */
export const fetchInflationData = async (startDate: Date, endDate: Date): Promise<string> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Oturum bulunamadı.');
  }

  const formattedStartDate = format(startDate, 'dd-MM-yyyy');
  const formattedEndDate = format(endDate, 'dd-MM-yyyy');

  // DÜZELTME: Sadece endpoint'in kendisini ekliyoruz.
  const url = `${API_BASE_URL}/inflation/fetch?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `Sunucu hatası: ${response.status}`);
    } catch (e) {
      throw new Error(`Sunucuya bağlanılamadı: ${response.status}`);
    }
  }
  return response.text();
};


/**
 * Veritabanında kayıtlı tüm enflasyon verilerini listeler.
 */
export const getAllInflationData = async (): Promise<InflationData[]> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Oturum bulunamadı.');
  }

  // DÜZELTME: Sadece endpoint'in kendisini ekliyoruz.
  const url = `${API_BASE_URL}/inflation`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Enflasyon verileri listelenirken bir hata oluştu.');
  }

  return response.json();
};