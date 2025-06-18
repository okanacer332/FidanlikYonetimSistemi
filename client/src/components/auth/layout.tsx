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
        display: { xs: 'flex', lg: 'grid' },
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Sol taraf içeriği (giriş formu) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
        {/* Sol üstte boşluk bırakan alan */}
        <Box sx={{ p: 3, pt: { xs: 0, lg: 4 }, pb: { xs: 0, lg: 4 } }}>
          {/* İçerik yok (logo artık sign-in-form içinde) */}
        </Box>

        {/* Ana form içeriği bölümü */}
        <Box sx={{ alignItems: 'center', display: 'flex', flex: '1 1 auto', justifyContent: 'center', p: { xs: 1, lg: 3 } }}> {/* Küçük ekranlarda (xs) p: 1 yaparak daha az boşluk bırakıyoruz */}
          <Box sx={{ maxWidth: '450px', width: '100%' }}>{children}</Box>
        </Box>
      </Box>

      {/* Sağ taraf içeriği (arka plan görseli) */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          flex: '1 1 auto',
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