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

// Tenant adını dinamik olarak hostname'den alacak bir fonksiyon
function getTenantNameFromHostname(): string | null {
  if (typeof window === 'undefined') {
    return null; // Sunucu tarafında çalışıyorsa
  }
  const hostname = window.location.hostname;
  // hostname "okan.fidanys.com" ise "okan.fidanys.com"u, "www.fidanys.com" veya "localhost" ise varsayılanı döndürmeli
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Geliştirme ortamında varsayılan tenant adını döndürelim.
    // Backend'de DataInitializer tarafından oluşturulan tenant adı ile eşleşmeli.
    // DataInitializer'da 'okan.fidanys.com' olarak tanımlanmış.
    return 'ata.fidanys.com'; // Backend'deki tenant ismi
  }

  // Örneğin: okan.fidanys.com -> okan.fidanys.com
  // Bu kısım production ortamında subdomain'den tenant adını çıkarmak için daha sofistike olabilir.
  // Şimdilik hostname'in tamamını veya ilgili kısmını tenant adı olarak alalım.
  // Basitlik adına, eğer subdomain tabanlı bir yapıdaysak ve tenant adı subdomain ise:
  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[parts.length - 2] === 'fidanys' && parts[parts.length - 1] === 'xyz') {
    if (parts[0] !== 'www' && parts[0] !== 'client') { // "client" da Next.js'in hostunda olabilir
      return hostname; // Örn: "okan.fidanys.com"
    }
  }
  // Eğer özel bir subdomain yoksa veya başka bir senaryo ise null döndürebiliriz
  // veya varsayılan bir tenant adı atayabiliriz.
  // Bu senaryoda login request'e 'tenantName'i eklediğimiz için null döndürmek daha güvenli olabilir.
  // Backend'e null giderse, backend'in varsayılan tenantı varsa onu kullanabilir.
  return null;
}


class AuthClient {
  async signInWithPassword(params: { username: string; password: string }): Promise<{ error?: string; data?: { token: string; user: BackendUser } }> {
    const { username, password } = params;
    const tenantName = getTenantNameFromHostname(); // Dinamik tenant adı

    if (!tenantName) {
      // Eğer tenant adı belirlenemezse, kullanıcıya bir hata gösterin veya varsayılanı kullanın
      // Bu durumda frontend'in subdomain'e veya varsayılan bir tenant adını ayarlamasına bağlıdır.
      return { error: 'Şirket adı (tenant name) belirlenemedi. Lütfen doğru adresi kullandığınızdan emin olun.' };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Backend'e tenantId yerine tenantName gönderiyoruz
        body: JSON.stringify({ username, password, tenantName }),
      });

      const data = await response.json(); // Bu satır 'Unexpected end of JSON input' hatasını verebilir

      if (!response.ok) {
        return { error: data.message || 'Kimlik doğrulama başarısız oldu.' };
      }

      const token = data.token;
      localStorage.setItem('authToken', token);

      // Kullanıcı bilgilerini çekerken tenantName veya tenantId'ye ihtiyacımız olacak.
      // JWT token içinde tenantId olduğu için, getUser() fonksiyonu bunu kullanabilir.
      // Ya da, backend'in /users/me endpoint'i de tenantName veya tenantId header bekleyebilir.
      const userResponse = await this.getUser();
      if (userResponse.error || !userResponse.data) {
        localStorage.removeItem('authToken');
        return { error: userResponse.error || 'Kullanıcı bilgileri alınamadı.' };
      }

      return { data: { token, user: userResponse.data } };

    } catch (err) {
      console.error('Sign-in error:', err);
      // 'Unexpected end of JSON input' hatasını daha açıklayıcı hale getirelim
      if (err instanceof SyntaxError && err.message.includes('JSON input')) {
          return { error: 'Sunucudan geçersiz bir yanıt alındı. Lütfen sunucu loglarını kontrol edin.' };
      }
      return { error: 'Ağ hatası veya sunucuya erişilemiyor.' };
    }
  }

  async getUser(): Promise<{ data?: BackendUser | null; error?: string }> {
    const token = localStorage.getItem('authToken');
    // Tenant adı artık doğrudan getUser için gerekli değil, JWT içinde tenantId var.

    if (!token) {
      return { data: null };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          // 'X-Tenant-Id' header'ını kaldırdık veya yoruma aldık.
          // JwtAuthenticationFilter, token'dan tenantId'yi zaten okuyup SecurityContext'e yerleştiriyor.
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