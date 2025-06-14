import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users'; // Users icon'unu ekleyelim

import { config } from '@/config';
// Kullanıcı listeleme ve filtreleme için Customers bileşenlerini temel alabiliriz
// import { CustomersFilters } from '@/components/dashboard/customer/customers-filters';
// import { CustomersTable } from '@/components/dashboard/customer/customers-table';

export const metadata = { title: `Kullanıcı Yönetimi | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  // Şimdilik boş bir sayfa ile başlayalım, API entegrasyonu ve bileşenleri daha sonra ekleyeceğiz.
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Kullanıcı Yönetimi</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {/* İsteğe bağlı olarak buraya import/export butonları eklenebilir */}
          </Stack>
        </Stack>
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
            Yeni Kullanıcı Ekle
          </Button>
        </div>
      </Stack>
      {/* Kullanıcı listesi ve filtreler buraya gelecek */}
      <Stack sx={{ alignItems: 'center', justifyContent: 'center', height: '200px', border: '1px dashed #ccc', borderRadius: '8px' }}>
        <UsersIcon fontSize="large" color="action" />
        <Typography variant="h6" color="text.secondary">Kullanıcı Listesi Buraya Gelecek</Typography>
      </Stack>
    </Stack>
  );
}