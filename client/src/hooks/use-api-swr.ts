'use client';

import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';

const fetcher = async (url: string) => {
  const token = localStorage.getItem('authToken');
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

export function useApiSWR<T>(url: string | null, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    fetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false,
      ...config,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}