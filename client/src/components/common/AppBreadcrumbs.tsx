// src/components/common/AppBreadcrumbs.tsx (Düzeltilmiş Hali)
'use client';

import * as React from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { House as HouseIcon } from '@phosphor-icons/react/dist/ssr/House';

// Türkçe çevirileri ekledik ve genişlettik.
const PATH_TRANSLATIONS: Record<string, string> = {
  dashboard: 'Anasayfa',
  plants: 'Fidan Yönetimi',
  customers: 'Müşteriler',
  orders: 'Siparişler',
  account: 'Hesap',
  settings: 'Ayarlar',
  invoices: 'Faturalar',
  suppliers: 'Tedarikçiler',
  warehouses: 'Depolar',
};

export function AppBreadcrumbs(): React.JSX.Element {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter((segment) => segment);

  // Eğer path "/dashboard" ise, breadcrumb gösterme.
  if (pathname === '/dashboard') {
    return <></>;
  }

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
      {/* Anasayfa linki her zaman başta olacak */}
      <Link
        component={NextLink}
        underline="hover"
        color="inherit"
        href="/dashboard"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <HouseIcon style={{ marginRight: '8px' }} />
        {PATH_TRANSLATIONS['dashboard']}
      </Link>

      {/* URL segmentlerini 'dashboard' hariç tutarak dön */}
      {pathSegments.slice(1).map((segment, index) => {
        // slice(1) ile 'dashboard' segmentini atlıyoruz.
        const href = `/${pathSegments.slice(0, index + 2).join('/')}`;
        const isLast = index === pathSegments.length - 2;
        const translatedText = PATH_TRANSLATIONS[segment] || segment;

        return isLast ? (
          <Typography key={href} color="text.primary">
            {translatedText}
          </Typography>
        ) : (
          <Link component={NextLink} underline="hover" color="inherit" href={href} key={href}>
            {translatedText}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}