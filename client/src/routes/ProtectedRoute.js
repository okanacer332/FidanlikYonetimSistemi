import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('auth-token');

  // Context'te kullanıcı yoksa ama token varsa, sayfa yenilenmiş olabilir.
  // Gerçek bir uygulamada burada token'ı doğrulayan bir istek atılır. Şimdilik token varlığını kabul ediyoruz.
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Eğer giriş yapılmışsa, alt rotaları (örn: Dashboard) göster
};

export default ProtectedRoute;