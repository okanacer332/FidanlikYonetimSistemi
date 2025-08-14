'use client';

import * as React from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { House as HouseIcon } from '@phosphor-icons/react/dist/ssr/House';

// Türkçe çevirileri genişletiyoruz.
const PATH_TRANSLATIONS: Record<string, string> = {
  dashboard: 'Anasayfa',
  // Tanımlar
  plants: 'Fidan Yönetimi',
  warehouses: 'Depo Yönetimi',
  customers: 'Müşteri Yönetimi',
  suppliers: 'Tedarikçi Yönetimi',
  // Muhasebe
  accounting: 'Muhasebe',
  'current-accounts': 'Cari Hesaplar',
  invoices: 'Faturalar',
  payments: 'Kasa & Banka',
  expenses: 'Gider Yönetimi',
  // Operasyonlar
  operations: 'Operasyonlar',
  orders: 'Sipariş Yönetimi',
  'goods-receipts': 'Mal Giriş Yönetimi',
  'production-batches': 'Üretim Partileri', // <-- YENİ EKLENDİ
  // Diğer
  'user-management': 'Kullanıcı Yönetimi',
  account: 'Hesap',
  settings: 'Ayarlar',
};

// ... (Dosyanın geri kalanı aynı kalacak)
const NON_CLICKABLE_PATHS = [
    '/dashboard/accounting',
    '/dashboard/operations',
];

export function AppBreadcrumbs(): React.JSX.Element {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter((segment) => segment);

  if (pathname === '/dashboard') {
    return <></>;
  }

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link component={NextLink} underline="hover" color="inherit" href="/dashboard" sx={{ display: 'flex', alignItems: 'center' }}>
        <HouseIcon style={{ marginRight: '8px' }} />
        {PATH_TRANSLATIONS['dashboard']}
      </Link>
      {pathSegments.slice(1).map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 2).join('/')}`;
        const isLast = index === pathSegments.length - 2;
        const isUUID = /^[a-f\d]{24}$/i.test(segment);
        const isClickable = !isLast && !NON_CLICKABLE_PATHS.includes(href);

        if (isLast && isUUID) {
            const parentSegment = pathSegments[index];
            const parentTranslation = PATH_TRANSLATIONS[parentSegment] || parentSegment;
            return ( <Typography key={href} color="text.primary"> Detay </Typography> );
        }
        
        if(isUUID) return null;
        const translatedText = PATH_TRANSLATIONS[segment] || segment.replace(/-/g, ' ');

        return isClickable ? (
          <Link component={NextLink} underline="hover" color="inherit" href={href} key={href}>
            {translatedText}
          </Link>
        ) : (
          <Typography key={href} color={isLast ? "text.primary" : "inherit"}>
            {translatedText}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
}