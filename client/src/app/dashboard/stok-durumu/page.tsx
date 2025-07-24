// client/src/app/dashboard/stok-durumu/page.tsx
import Head from 'next/head';
import { Box, Container, Stack, Typography } from '@mui/material';

import { Breadcrumbs } from '@/components/core/breadcrumbs';
import { paths } from '@/paths';
import { StockTable } from '@/components/dashboard/stock/stock-table';

const page = () => {
  return (
    <>
      <Head>
        <title>
          Stok Durumu | FidanYS
        </title>
      </Head>
      <Box
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={4}>
            <Stack
              direction="row"
              spacing={4}
              sx={{ alignItems: 'center' }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4">Stok Durumu</Typography>
                {/* Breadcrumbs bileşeninin güncellenmiş kullanımı */}
                <Breadcrumbs
                  items={[
                    { label: 'Gösterge Paneli', href: paths.dashboard.overview },
                    { label: 'Operasyonlar' }, // Operasyonlar sadece etiket olarak
                    { label: 'Stok Durumu' }, // Mevcut sayfa
                  ]}
                />
              </Box>
            </Stack>
            <StockTable />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default page;