'use client';

import * as React from 'react';

// Bu hook, SWR'a geçmeden önceki manuel veri çekme yöntemimizdir.
// Projenin eski bölümlerinin çalışmaya devam etmesi için geçici olarak geri yüklendi.
// Uzun vadeli hedef, bu hook'u kullanan tüm sayfaları useApiSWR'a geçirmektir.

interface UseApiOptions<TData, TError> {
  url: string | null;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

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
  url: string | null,
  options?: UseApiOptions<TData, TError>
): UseApiResult<TData, TError> {
  const { initialData, fetchOnMount = true, onSuccess, onError, method = 'GET', body, headers } = options || {};
  const [data, setData] = React.useState<TData | undefined>(initialData);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<TError | undefined>(undefined);

  const fetchDataAsync = React.useCallback(
    async (currentUrl: string, fetchOptions?: { method?: string; body?: Record<string, unknown>; headers?: Record<string, string> }) => {
      setIsLoading(true);
      setError(undefined);
      try {
        const result = await fetchData<TData>(currentUrl, fetchOptions);
        setData(result);
        onSuccess?.(result);
      } catch (err) {
        setError(err as TError);
        onError?.(err as TError);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );
  
  React.useEffect(() => {
    if (fetchOnMount && url) {
      void fetchDataAsync(url, { method, body, headers });
    }
  }, [url, fetchOnMount, fetchDataAsync, method, body, headers]);


  const refetch = React.useCallback(
    async (newUrl?: string | null, optionsOverride?: Omit<UseApiOptions<TData, TError>, 'initialData' | 'fetchOnMount'>) => {
        const urlToFetch = newUrl ?? url;
        const finalOptions = { method, body, headers, ...optionsOverride };

        if (urlToFetch) {
            await fetchDataAsync(urlToFetch, finalOptions);
        } else {
            console.warn('Refetch çağrıldı ancak geçerli bir URL bulunamadı.');
        }
    },
    [fetchDataAsync, url, method, body, headers]
  );

  return { data, isLoading, error, refetch };
}