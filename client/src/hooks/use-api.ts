'use client';

import * as React from 'react';

interface UseApiOptions<TData, TError> {
  url: string | null; // url artık null da olabilir
  initialData?: TData;
  fetchOnMount?: boolean;
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  method?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

interface UseApiResult<TData, TError> {
  data: TData | undefined;
  isLoading: boolean;
  error: TError | undefined;
  refetch: (newUrl?: string | null, options?: Omit<UseApiOptions<TData, TError>, 'initialData' | 'fetchOnMount'>) => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const fetchData = async <T>(
  url: string, // Bu fonksiyon hala string URL bekler
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
  url: string | null, // Burası güncellendi
  options?: UseApiOptions<TData, TError>
): UseApiResult<TData, TError> {
  const { initialData, fetchOnMount = true, onSuccess, onError, method = 'GET', body, headers } = options || {};
  const [data, setData] = React.useState<TData | undefined>(initialData);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<TError | undefined>(undefined);

  const fetchDataAsync = React.useCallback(
    async (currentUrl: string) => { // Bu fonksiyon hala string URL bekler
      setIsLoading(true);
      setError(undefined);
      try {
        const result = await fetchData<TData>(currentUrl, {
          method: method,
          body: body,
          headers: headers,
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
    // url null değilse ve fetchOnMount true ise veri çek
    if (fetchOnMount && url) {
      void fetchDataAsync(url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, fetchOnMount]);

  const refetch = React.useCallback(
    async (newUrl?: string | null, optionsOverride?: Omit<UseApiOptions<TData, TError>, 'initialData' | 'fetchOnMount'>) => {
        const urlToFetch = newUrl ?? url; // Eğer newUrl null ise, mevcut url'i kullan
        if (urlToFetch) { // urlToFetch null değilse fetch yap
            await fetchDataAsync(urlToFetch);
        } else {
            console.warn('Refetch çağrıldı ancak geçerli bir URL bulunamadı.');
        }
    },
    [fetchDataAsync, url]
  );

  return { data, isLoading, error, refetch };
}