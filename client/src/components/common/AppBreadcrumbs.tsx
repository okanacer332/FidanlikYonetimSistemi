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
  'current-accounts': 'Cari Hesaplar (Müşteri)',
  invoices: 'Faturalar',
  payments: 'Kasa & Banka Hareketleri',
  expenses: 'Gider Yönetimi',
  // Operasyonlar
  operations: 'Operasyonlar',
  orders: 'Sipariş Yönetimi',
  // Diğer
  account: 'Hesap',
  settings: 'Ayarlar',
};

// --- YENİ: Tıklanabilir olmayan yolları burada tanımlıyoruz ---
const NON_CLICKABLE_PATHS = [
    '/dashboard/accounting',
    '/dashboard/operations',
    '/dashboard/reports',
    '/dashboard/system',
    '/dashboard/settings'
];


export function AppBreadcrumbs(): React.JSX.Element {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter((segment) => segment);

  if (pathname === '/dashboard') {
    return <></>;
  }

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
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

      {pathSegments.slice(1).map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 2).join('/')}`;
        const isLast = index === pathSegments.length - 2;
        const isUUID = /^[a-f\d]{24}$/i.test(segment);
        
        // YENİ KURAL: Eğer yol, tıklanabilir olmayanlar listesindeyse veya son segment ise, link yapma.
        const isClickable = !isLast && !NON_CLICKABLE_PATHS.includes(href);

        if (isLast && isUUID) {
            const parentSegment = pathSegments[index];
            const parentTranslation = PATH_TRANSLATIONS[parentSegment] || parentSegment;
            return (
                <Typography key={href} color="text.primary">
                    {parentTranslation} Detayı
                </Typography>
            );
        }
        
        if(isUUID) return null;

        const translatedText = PATH_TRANSLATIONS[segment] || segment;

        // YENİ MANTIK: Sadece isClickable true ise Link'e dönüştür.
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