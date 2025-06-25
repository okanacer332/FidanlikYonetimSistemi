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
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Sol taraf içeriği (giriş formu) */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          pt: { xs: 2, sm: 3, lg: 0 },
          pb: { xs: 2, sm: 3, lg: 0 },
          px: { xs: 2, sm: 3, lg: 0 },
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ maxWidth: '450px', width: '100%' }}>
            {children}
        </Box>
      </Box>

      {/* Sağ taraf içeriği (arka plan görseli) - Yalnızca büyük ekranlarda görünür olacak */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' }, // Bu kısım değiştirilmedi, çünkü buradaki logo büyük ekrana ait.
          alignItems: 'center',
          justifyContent: 'center',
          background: 'url(/assets/asd.png) no-repeat center center',
          backgroundSize: 'cover',
          backgroundColor: '#090E23',
          p: 0,
        }}
      >
        {/* Bu alanda herhangi bir metin veya ekstra logo yok. Arka plan görseli tüm alanı kaplıyor. */}
        {/* Önceden burada bulunan <DynamicLogo /> kaldırıldı */}
      </Box>
    </Box>
  );
}