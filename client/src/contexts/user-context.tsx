// Konum: client/src/contexts/user-context.tsx
'use client';

import * as React from 'react';
import { authClient } from '@/lib/auth/client';

// Frontend'deki User ve Role interface'lerini backend'deki BackendUser ve Role modellerine göre güncelleyelim.
export interface Role {
  id: string;
  name: string; // Backend'deki Role modelinde 'name' alanı var
  description?: string;
}

export interface User { // Frontend'de kullanılacak User tipi
  id: string;
  username: string; // Backend'den gelen 'username' alanına karşılık geliyor
  email: string;
  roles?: Role[]; // Backend'den gelen 'roles' alanına karşılık geliyor
  tenantId?: string; // Backend'den gelen 'tenantId' alanına karşılık geliyor
}

export interface UserContextValue {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  checkSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const [user, setUser] = React.useState<User | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true); // Başlangıçta true olarak ayarlandı

  const checkSession = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error: authError } = await authClient.getUser();
      if (authError) {
        setError(authError);
        setUser(null);
        console.error("Session check failed:", authError);
      } else {
        if (data) {
          // Backend'den gelen BackendUser tipini frontend'deki User tipine dönüştür
          const formattedUser: User = {
            id: data.id,
            username: data.username, // Burası güncellendi
            email: data.email,
            roles: data.roles || [], // Eğer roles yoksa boş array ata
            tenantId: data.tenantId,
          };
          setUser(formattedUser);
          setError(null);
        } else {
          setUser(null);
          setError(null); // Kullanıcı yoksa hata mesajı da olmaz
        }
      }
    } catch (err) {
      setError('Bilinmeyen bir oturum kontrol hatası oluştu.');
      setUser(null);
      console.error("Unknown session check error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authClient.signOut();
      setUser(null);
      setError(null);
    } catch (err) {
      setError('Çıkış yaparken bir hata oluştu.');
      console.error("Sign out error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    checkSession().catch((err) => {
      console.error(err);
    });
  }, [checkSession]);

  return <UserContext.Provider value={{ user, error, isLoading, checkSession, signOut }}>{children}</UserContext.Provider>;
}

export const UserConsumer = UserContext.Consumer;