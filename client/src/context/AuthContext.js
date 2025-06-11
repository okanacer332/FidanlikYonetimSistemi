import React, { createContext, useContext, useState } from 'react';

// Context'i oluşturuyoruz
const AuthContext = createContext(null);

// Uygulamayı sarmalayacak olan Provider bileşeni
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Başlangıçta kullanıcı yok

  const login = (userData, token) => {
    localStorage.setItem('auth-token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    setUser(null);
  };

  // Bu değerleri tüm alt bileşenlere sunuyoruz
  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Bu hook, herhangi bir bileşenden context'e kolayca erişmemizi sağlar
export const useAuth = () => {
  return useContext(AuthContext);
};