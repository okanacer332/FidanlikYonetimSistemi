// Konum: client/src/contexts/user-context.tsx
'use client';

import * as React from 'react';
import { useLazyQuery, gql } from '@apollo/client';

export interface Role {
  id: string;
  rolAdi: string;
}

export interface User {
  id: string;
  kullaniciAdi: string;
  email: string;
  roller: Role[];
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

const GET_CURRENT_USER = gql`
  query Me {
    me {
      id
      kullaniciAdi
      email
      roller {
        id
        rolAdi
      }
    }
  }
`;

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const [user, setUser] = React.useState<User | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [fetchUser, { loading, client }] = useLazyQuery(GET_CURRENT_USER, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setUser(data.me);
      setError(null);
    },
    onError: (error) => {
      localStorage.removeItem('authToken');
      setUser(null);
      setError(error.message);
      console.error("Session check failed:", error.message);
    },
  });
  
  const isLoading = loading || (user === null && !!localStorage.getItem('authToken'));

  const checkSession = React.useCallback(async (): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (token) {
      await fetchUser();
    } else {
      setUser(null);
    }
  }, [fetchUser]);

  const signOut = React.useCallback(async (): Promise<void> => {
    localStorage.removeItem('authToken');
    setUser(null);
    if (client) {
      await client.resetStore();
    }
  }, [client]);

  React.useEffect(() => {
    checkSession().catch((err) => {
      console.error(err);
    });
  }, [checkSession]);

  return <UserContext.Provider value={{ user, error, isLoading, checkSession, signOut }}>{children}</UserContext.Provider>;
}

export const UserConsumer = UserContext.Consumer;