'use client';

import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';

// 1. Tüm fetch işlemlerini yönetecek merkezi bir "fetcher" fonksiyonu
const fetcher = async (url: string) => {
  const token = localStorage.getItem('authToken');
  // Token yoksa istek atmayı deneme, bu SWR tarafından otomatik olarak yönetilecek
  if (!token) {
    throw new Error('Not authorized.');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Bir sunucu hatası oluştu.' }));
    throw new Error(errorData.message || 'Veri alınamadı.');
  }

  return response.json();
};

// 2. SWR'ı bizim projemiz için yapılandıran özel hook'umuz
export function useApiSWR<T>(url: string | null, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url, // Eğer URL null ise, SWR isteği otomatik olarak yapmaz.
    fetcher,
    {
      // Varsayılan SWR ayarları
      revalidateOnFocus: true, // Kullanıcı pencereye geri döndüğünde veriyi tazele
      shouldRetryOnError: false, // Hata durumunda tekrar denemeyi kapatabiliriz
      ...config, // Dışarıdan gelen ek ayarlar
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate, // Veriyi manuel olarak yenilemek için
  };
}