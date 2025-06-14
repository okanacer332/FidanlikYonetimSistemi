// client/src/types/user.ts
export interface Role {
  id: string;
  name: string; // Backend'deki Role modelinde 'name' alanı var
  description?: string;
  tenantId: string; // Rollerin de tenantId'si var
}

export interface User { // Frontend'de kullanılacak ana User tipi (BackendUser'dan formatlanmış hali)
  id: string;
  kullaniciAdi: string; // Backend'den gelen 'username' alanına karşılık geliyor
  email: string;
  roles?: Role[]; // Backend'den gelen 'roles' alanına karşılık geliyor
  tenantId: string; // Backend'den gelen 'tenantId' alanı
}

// Yeni kullanıcı oluşturma için backend'e gönderilecek DTO'ya karşılık
export interface UserCreateFormValues {
  username: string;
  email: string;
  password: string;
  roleIds: string[]; // Rol ID'leri listesi
}