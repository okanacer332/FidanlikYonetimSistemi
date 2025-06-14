// Konum: client/src/lib/auth/client.ts
'use client';

// User type'ını frontend'deki User ve Role modellerine göre güncelleyelim.
export interface Role {
  id: string;
  name: string; // Backend'deki Role modelinde 'name' alanı var
  description?: string;
}

export interface BackendUser {
  id: string;
  username: string; // Backend'de 'username' olarak geçiyor
  email: string;
  roleIds?: string[]; // Backend'den gelen rol ID'leri
  roles?: Role[]; // Backend'den gelen dolu rol objeleri (User modeline transient olarak ekledik)
  tenantId: string; // Backend'den gelen 'tenantId' alanı
}

// Tenant ID'yi dinamik olarak subdomain'den alacak bir fonksiyon
function getTenantIdFromHostname(): string | null {
  if (typeof window === 'undefined') {
    return null; // Sunucu tarafında çalışıyorsa
  }
  const hostname = window.location.hostname;
  // hostname "okan.fidanys.com" ise "okan"ı, "www.fidanys.com" ise null/varsayılanı döndürmeli
  // Local development için "localhost" veya IP adresi durumu da ele alınmalı
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Geliştirme ortamında sabit bir tenantId dönebiliriz veya bir seçim mekanizması ekleyebiliriz.
    // Şimdilik seed ettiğiniz tenantId'yi kullanalım.
    return '684dafb326785d716526d38d'; // <-- Seed ettiğiniz tenantId
  }

  // Örneğin: okan.fidanys.com -> okan
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    // İlk parça subdomain ise (örn. "okan") ve bu bir "www" değilse
    if (parts[0] !== 'www' && parts[0] !== 'client') { // "client" da Next.js'in hostunda olabilir
      // Burada aslında subdomain'in kendisi tenantId değil, subdomain'den tenant'ı lookup yapmalıyız.
      // Ancak basitlik adına şimdilik direkt subdomain'in bir parçası olduğunu varsayabiliriz.
      // Ya da, backend'de subdomain'e karşılık gelen tenantId'yi dönecek bir endpoint olur.
      // Şimdilik, subdomain'in tenant'ın adı olduğunu ve backend'in bu adı bir tenantId'ye çevirebildiğini varsayalım.
      // VEYA daha basit: login request'inde tenantName'i göndeririz, backend o name'i ID'ye çevirir.
      // Bu senaryoda ise, seed ettiğiniz tenant'ın `name` alanı `okan.fidanys.com` olduğu için, onu kullanabiliriz.
      return parts[0] + '.' + parts[1] + '.' + parts[2]; // fidanys.com için parts[0], parts[1], parts[2]
                                                       // okan.fidanys.com için okan.fidanys.com döndürür
    }
  }
  return null; // TenantId bulunamazsa
}


class AuthClient {
  async signInWithPassword(params: { username: string; password: string }): Promise<{ error?: string; data?: { token: string; user: BackendUser } }> {
    const { username, password } = params;
    const tenantId = getTenantIdFromHostname(); // Dinamik tenantId

    if (!tenantId) {
      return { error: 'Şirket kimliği (tenant ID) belirlenemedi.' };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, tenantId }), // tenantId'yi gönder
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Kimlik doğrulama başarısız oldu.' };
      }

      const token = data.token;
      localStorage.setItem('authToken', token);

      const userResponse = await this.getUser();
      if (userResponse.error || !userResponse.data) {
        localStorage.removeItem('authToken');
        return { error: userResponse.error || 'Kullanıcı bilgileri alınamadı.' };
      }

      return { data: { token, user: userResponse.data } };

    } catch (err) {
      console.error('Sign-in error:', err);
      return { error: 'Ağ hatası veya sunucuya erişilemiyor.' };
    }
  }

  async getUser(): Promise<{ data?: BackendUser | null; error?: string }> {
    const token = localStorage.getItem('authToken');
    const tenantId = getTenantIdFromHostname(); // Dinamik tenantId

    if (!token) {
      return { data: null };
    }

    if (!tenantId) {
        return { error: 'Şirket kimliği (tenant ID) belirlenemedi.' };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Id': tenantId, // Başka bir seçenek: tenantId'yi özel bir header olarak göndermek
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        return { error: 'Oturum süresi doldu veya yetkisiz erişim.' };
      }

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Kullanıcı bilgileri alınamadı.' };
      }

      return { data: data };

    } catch (err) {
      console.error('Get user error:', err);
      return { error: 'Ağ hatası veya sunucuya erişilemiyor.' };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('authToken');
    return {};
  }

  async signUp(_: any): Promise<{ error?: string }> {
    return { error: 'Kayıt olma özelliği henüz implemente edilmedi.' };
  }

  async signInWithOAuth(_: any): Promise<{ error?: string }> {
    return { error: 'Sosyal medya ile giriş implemente edilmedi.' };
  }

  async resetPassword(_: any): Promise<{ error?: string }> {
    return { error: 'Şifre sıfırlama implemente edilmedi.' };
  }

  async updatePassword(_: any): Promise<{ error?: string }> {
    return { error: 'Şifre güncelleme implemente edilmedi.' };
  }
}

export const authClient = new AuthClient();