// Konum: client/src/components/auth/layout.tsx
'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from '@/paths';
import { DynamicLogo } from '@/components/core/logo';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: 'grid', // Flex yerine doğrudan grid kullanıyoruz
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        minHeight: '100vh', // Sayfanın tüm dikey yüksekliğini kaplamasını sağlar
        overflow: 'hidden', // Taşan içeriği gizler, kaydırma çubuklarını engeller
      }}
    >
      {/* Sol taraf içeriği (giriş formu) */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          // Telefon ve tablet ekranlarında üstteki boşluğu azaltalım
          pt: { xs: 2, sm: 3, lg: 0 }, // xs ve sm'de daha az padding-top
          pb: { xs: 2, sm: 3, lg: 0 }, // xs ve sm'de daha az padding-bottom
          px: { xs: 2, sm: 3, lg: 0 }, // xs ve sm'de yatay padding
          alignItems: 'center', // İçeriği dikeyde ortalamak için
          justifyContent: 'center', // İçeriği yatayda ortalamak için
        }}
      >
        {/* Boş üst logo alanı (artık sign-in-form içinde) */}
        {/* Burada ekstra bir Box bırakmaya gerek yok, padding yukarıdaki Box'tan kontrol ediliyor */}

        {/* Ana form içeriği bölümü */}
        <Box sx={{ maxWidth: '450px', width: '100%' }}>
            {children}
        </Box>
      </Box>

      {/* Sağ taraf içeriği (arka plan görseli) */}
      <Box
        sx={{
          // Sadece büyük ekranlarda (lg ve üzeri) göster
          display: { xs: 'none', lg: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          background: 'url(/assets/acrtech-fidanfys-logo.png) no-repeat center center',
          backgroundSize: 'cover',
          backgroundColor: '#090E23',
          color: 'var(--mui-palette-common-white)',
          p: 0,
        }}
      >
        {/* Bu alanda herhangi bir metin veya ekstra logo yok. Arka plan görseli tüm alanı kaplıyor. */}
      </Box>
    </Box>
  );
}