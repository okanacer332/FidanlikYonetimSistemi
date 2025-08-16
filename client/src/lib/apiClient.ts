// Konum: src/lib/apiClient.ts

// Backend API'sinin sunucu içindeki göreceli yolunu burada merkezi olarak tanımlıyoruz.
const API_PREFIX = '/api/v1';

// Standart fetch için genişletilmiş options tipi
interface ApiClientOptions extends RequestInit {
  body?: any;
}

/**
 * Tüm API isteklerini yönetecek merkezi fonksiyon.
 * Token ekleme, URL oluşturma ve temel hata yönetimini yapar.
 */
async function fetcher<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  // Sunucu tarafında (SSR/Next.js build aşaması) localStorage'a erişmeye çalışmasını engelliyoruz.
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  // DÜZELTME: headers nesnesinin tipini daha esnek hale getiriyoruz.
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Gönderilecek body'yi JSON string'e çevir
  const body = options.body ? JSON.stringify(options.body) : undefined;

  // URL'yi oluştur.
  const url = `${API_PREFIX}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });

  // Hata durumunu merkezi olarak yönet
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `Sunucu hatası: ${response.statusText}`,
    }));
    throw new Error(errorData.message || 'Bilinmeyen bir sunucu hatası oluştu.');
  }
  
  // 204 No Content gibi body içermeyen başarılı yanıtlar için
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Farklı HTTP metodları için kullanımı kolaylaştıracak bir nesne
export const apiClient = {
  get: <T>(endpoint: string, options?: ApiClientOptions) => 
    fetcher<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint:string, data: any, options?: ApiClientOptions) => 
    fetcher<T>(endpoint, { ...options, method: 'POST', body: data }),

  put: <T>(endpoint:string, data: any, options?: ApiClientOptions) => 
    fetcher<T>(endpoint, { ...options, method: 'PUT', body: data }),
  
  patch: <T>(endpoint: string, data: any, options?: ApiClientOptions) =>
    fetcher<T>(endpoint, { ...options, method: 'PATCH', body: data }),

  delete: <T>(endpoint: string, options?: ApiClientOptions) => 
    fetcher<T>(endpoint, { ...options, method: 'DELETE' }),
};