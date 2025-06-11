// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FidanlarPage from './pages/FidanlarPage';
import MusterilerPage from './pages/MusterilerPage';
import SiparislerPage from './pages/SiparislerPage';
import KullanicilarPage from './pages/KullanicilarPage';

import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import { useAuth } from './context/AuthContext';


function App() {
  const { user } = useAuth();
  const token = localStorage.getItem('auth-token');

  return (
    <Routes>
      {/* Giriş yapmamışsa Login'i göster, yapmışsa Dashboard'a yönlendir */}
      <Route path="/login" element={!user && !token ? <LoginPage /> : <Navigate to="/" />} />
      
      {/* Korumalı Rotalar */}
      <Route element={<ProtectedRoute />}>
        {/* Bu rotaların hepsi MainLayout'un içinde gösterilecek */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/fidanlar" element={<FidanlarPage />} />
          <Route path="/musteriler" element={<MusterilerPage />} />
          <Route path="/siparisler" element={<SiparislerPage />} />
          <Route path="/kullanicilar" element={<KullanicilarPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;