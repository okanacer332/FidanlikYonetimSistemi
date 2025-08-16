'use client';

import useSWR from 'swr';
import type { SWRConfiguration, BareFetcher } from 'swr'; // <-- BareFetcher'ı import et
import { apiClient } from '@/lib/apiClient';

// DÜZELTME: Fetcher fonksiyonunu SWR'ın beklediği "BareFetcher" tipine uygun hale getiriyoruz.
// Bu, SWR'a fetcher'ımızın genel bir T tipiyle çalışacağını ve Promise<T> döndüreceğini söyler.
const fetcher: BareFetcher<any> = (url: string) => apiClient.get(url);

export function useApiSWR<T>(url: string | null, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    fetcher, // Düzeltilmiş fetcher'ı burada kullanıyoruz
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