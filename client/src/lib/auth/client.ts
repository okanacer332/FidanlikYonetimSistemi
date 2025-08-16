// Konum: client/src/lib/auth/client.ts
'use client';

import { apiClient } from '@/lib/apiClient'; // <-- 1. YENİ İSTEMCİYİ IMPORT ET

// User ve Role tipleri aynı kalabilir.
export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface BackendUser {
  id: string;
  username: string;
  email: string;
  roleIds?: string[];
  roles?: Role[];
  tenantId: string;
}

// Tenant adını dinamik olarak hostname'den alacak fonksiyon (BU DOĞRU, AYNI KALIYOR)
function getTenantNameFromHostname(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const hostname = window.location.hostname;
  
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'ata.fidanys.com.tr';
  }

  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[parts.length - 2] === 'fidanys') {
    const tld = parts[parts.length - 1];
    if (tld === 'tr' && parts[parts.length - 3] === 'com') {
      if (parts[0] !== 'www' && parts[0] !== 'client') return hostname;
    } else if (tld === 'xyz') {
       if (parts[0] !== 'www' && parts[0] !== 'client') return hostname;
    }
  }
  
  return null;
}

class AuthClient {
  // 2. signInWithPassword fonksiyonunu apiClient kullanacak şekilde GÜNCELLE
  async signInWithPassword(params: { username: string; password: string }): Promise<{ error?: string; data?: { token: string; user: BackendUser } }> {
    const { username, password } = params;
    const tenantName = getTenantNameFromHostname();

    if (!tenantName) {
      return { error: 'Şirket adı (tenant name) belirlenemedi. Lütfen doğru adresi kullandığınızdan emin olun.' };
    }

    try {
      // Eski fetch yerine apiClient.post kullanıyoruz. URL artık göreceli.
      const loginResponse = await apiClient.post<{ token: string }>('/auth/login', {
        username,
        password,
        tenantName,
      });

      const token = loginResponse.token;
      localStorage.setItem('authToken', token);

      const userResponse = await this.getUser();
      if (userResponse.error || !userResponse.data) {
        localStorage.removeItem('authToken');
        return { error: userResponse.error || 'Kullanıcı bilgileri alınamadı.' };
      }

      return { data: { token, user: userResponse.data } };

    } catch (err) {
      console.error('Sign-in error:', err);
      return { error: err instanceof Error ? err.message : 'Giriş sırasında bir hata oluştu.' };
    }
  }

  // 3. getUser fonksiyonunu apiClient kullanacak şekilde GÜNCELLE
  async getUser(): Promise<{ data?: BackendUser | null; error?: string }> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { data: null };
    }

    try {
      // Eski fetch yerine apiClient.get kullanıyoruz.
      const data = await apiClient.get<BackendUser>('/users/me');
      return { data: data };
    } catch (err) {
      // Token geçersizse (401/403), apiClient hata fırlatacaktır.
      // Bu hatayı yakalayıp token'ı temizleyebiliriz.
      localStorage.removeItem('authToken');
      console.error('Get user error:', err);
      return { error: err instanceof Error ? err.message : 'Oturum doğrulanırken bir hata oluştu.' };
    }
  }

  // signOut fonksiyonu aynı kalabilir, API çağrısı yapmıyor.
  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('authToken');
    return {};
  }

  // Diğer fonksiyonlar aynı kalabilir.
  async signUp(_: any): Promise<{ error?: string }> { return { error: 'Kayıt olma özelliği henüz implemente edilmedi.' }; }
  async signInWithOAuth(_: any): Promise<{ error?: string }> { return { error: 'Sosyal medya ile giriş implemente edilmedi.' }; }
  async resetPassword(_: any): Promise<{ error?: string }> { return { error: 'Şifre sıfırlama implemente edilmedi.' }; }
  async updatePassword(_: any): Promise<{ error?: string }> { return { error: 'Şifre güncelleme implemente edilmedi.' }; }
}

export const authClient = new AuthClient();