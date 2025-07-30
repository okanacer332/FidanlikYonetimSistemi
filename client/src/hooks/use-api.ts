'use client';

import * as React from 'react';

interface UseApiOptions<TData, TError> {
  url: string;
  initialData?: TData;
  fetchOnMount?: boolean; // Bileşen yüklendiğinde otomatik veri çekilsin mi? (varsayılan: true)
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  // Eğer post/put için body veya method gibi ek seçenekler gerekiyorsa buraya eklenebilir
  method?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

interface UseApiResult<TData, TError> {
  data: TData | undefined;
  isLoading: boolean;
  error: TError | undefined;
  refetch: (newUrl?: string, options?: Omit<UseApiOptions<TData, TError>, 'initialData' | 'fetchOnMount'>) => Promise<void>;
}

// Projendeki merkezi API URL'sini .env dosyasından alıyoruz
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Axios veya fetch ile yapılan genel veri çekme fonksiyonu
// Bu fonksiyon, useApi hook'u tarafından kullanılacak.
const fetchData = async <T>(
  url: string,
  options?: { method?: string; body?: Record<string, unknown>; headers?: Record<string, string> }
): Promise<T> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options?.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: options?.method || 'GET',
    headers: defaultHeaders,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `Veri alınamadı: ${response.status}`);
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message || `Veri alınamadı: ${response.status}`);
      }
      throw new Error(`Veri alınamadı: ${response.status}`);
    }
  }

  return response.json();
};

export function useApi<TData = unknown, TError extends Error = Error>(
  url: string,
  options?: UseApiOptions<TData, TError>
): UseApiResult<TData, TError> {
  const { initialData, fetchOnMount = true, onSuccess, onError, method = 'GET', body, headers } = options || {};
  const [data, setData] = React.useState<TData | undefined>(initialData);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<TError | undefined>(undefined);

  const fetchDataAsync = React.useCallback(
    async (currentUrl: string, currentOptions?: Omit<UseApiOptions<TData, TError>, 'initialData' | 'fetchOnMount'>) => {
      setIsLoading(true);
      setError(undefined);
      try {
        const result = await fetchData<TData>(currentUrl, {
          method: currentOptions?.method || method,
          body: currentOptions?.body || body,
          headers: currentOptions?.headers || headers,
        });
        setData(result);
        onSuccess?.(result);
      } catch (err) {
        setError(err as TError);
        onError?.(err as TError);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError, method, body, headers]
  );

  React.useEffect(() => {
    if (fetchOnMount && url) {
      void fetchDataAsync(url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, fetchOnMount]); // fetchDataAsync'i bağımlılıklara eklemiyoruz, çünkü o zaten kendi bağımlılıklarını yönetiyor.

  const refetch = React.useCallback(
    async (newUrl?: string, optionsOverride?: Omit<UseApiOptions<TData, TError>, 'initialData' | 'fetchOnMount'>) => {
      await fetchDataAsync(newUrl || url, optionsOverride);
    },
    [fetchDataAsync, url]
  );

  return { data, isLoading, error, refetch };
}