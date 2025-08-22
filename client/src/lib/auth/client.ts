// Konum: client/src/lib/auth/client.ts
'use client';

import { apiClient } from '@/lib/apiClient';

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

const isBrowser = typeof window !== 'undefined';

function getTenantNameFromHostname(): string | null {
  if (!isBrowser) {
    return null;
  }
  const hostname = window.location.hostname;

  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'ata.fidanys.com.tr';
  }

  if (hostname.endsWith('.fidanys.com.tr') || hostname.endsWith('.fidanys.xyz')) {
    if (hostname !== 'fidanys.com.tr' && hostname !== 'fidanys.xyz') {
      return hostname;
    }
  }
  return null;
}

class AuthClient {
  async signInWithPassword(params: { username: string; password: string }): Promise<{ error?: string; data?: { token: string; user: BackendUser } }> {
    const { username, password } = params;
    const tenantName = getTenantNameFromHostname();

    if (!tenantName) {
      return { error: 'Şirket adı (tenant name) belirlenemedi. Lütfen doğru adresi kullandığınızdan emin olun.' };
    }

    try {
      // YENİLEME BAŞLANGICI
      let loginResponse;
      try {
        loginResponse = await apiClient.post<{ token: string }>('/auth/login', {
          username,
          password,
          tenantName,
        });
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Giriş sırasında bir hata oluştu.' };
      }
      // YENİLEME BİTİŞİ

      const token = loginResponse.token;
      if (isBrowser) {
        localStorage.setItem('authToken', token);
      }

      const userResponse = await this.getUser();
      if (userResponse.error || !userResponse.data) {
        if (isBrowser) {
          localStorage.removeItem('authToken');
        }
        return { error: userResponse.error || 'Kullanıcı bilgileri alınamadı.' };
      }

      return { data: { token, user: userResponse.data } };

    } catch (err) {
      console.error('Sign-in error:', err);
      return { error: err instanceof Error ? err.message : 'Giriş sırasında bir hata oluştu.' };
    }
  }

  async getUser(): Promise<{ data?: BackendUser | null; error?: string }> {
    const token = isBrowser ? localStorage.getItem('authToken') : null;
    if (!token) {
      return { data: null };
    }

    try {
      const data = await apiClient.get<BackendUser>('/users/me');
      return { data: data };
    } catch (err) {
      if (isBrowser) {
        localStorage.removeItem('authToken');
      }
      console.error('Get user error:', err);
      return { error: err instanceof Error ? err.message : 'Oturum doğrulanırken bir hata oluştu.' };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    if (isBrowser) {
      localStorage.removeItem('authToken');
    }
    return {};
  }

  async signUp(_: any): Promise<{ error?: string }> { return { error: 'Kayıt olma özelliği henüz implemente edilmedi.' }; }
  async signInWithOAuth(_: any): Promise<{ error?: string }> { return { error: 'Sosyal medya ile giriş implemente edilmedi.' }; }
  async resetPassword(_: any): Promise<{ error?: string }> { return { error: 'Şifre sıfırlama implemente edilmedi.' }; }
  async updatePassword(_: any): Promise<{ error?: string }> { return { error: 'Şifre güncelleme implemente edilmedi.' }; }
}

export const authClient = new AuthClient();