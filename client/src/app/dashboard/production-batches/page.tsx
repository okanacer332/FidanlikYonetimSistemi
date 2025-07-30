'use client'; // Bu satırı koruyun!

import * as React from 'react';
// type { Metadata } from 'next'; // Artık gerekli değilse kaldırılabilir
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { ProductionBatchesTable } from '@/components/dashboard/production-batches/production-batches-table';
import { ProductionBatchCreateForm } from '@/components/dashboard/production-batches/production-batch-create-form';
import { Button } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Card } from '@mui/material';
import { CardHeader } from '@mui/material';
import { CardContent } from '@mui/material';

// export const metadata = { title: `Üretim Partileri | ${config.site.name}` } satisfies Metadata; // BU SATIRI KALDIRIN!

export default function ProductionBatchesPage(): React.JSX.Element {
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState<boolean>(false);

  const handleCreateFormToggle = () => {
    setIsCreateFormOpen((prev) => !prev);
  };

  const handleProductionBatchCreated = () => {
    setIsCreateFormOpen(false); // Formu kapat
    console.log('Yeni üretim partisi başarıyla oluşturuldu, tablo yenilenmeli.');
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4">Üretim Partileri</Typography>
        </Stack>
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleCreateFormToggle}>
            Yeni Parti Oluştur
          </Button>
        </div>
      </Stack>
      {isCreateFormOpen && (
        <Card>
          <CardHeader title="Yeni Üretim Partisi Oluştur" />
          <CardContent>
            <ProductionBatchCreateForm onClose={handleCreateFormToggle} onSuccess={handleProductionBatchCreated} />
          </CardContent>
        </Card>
      )}
      <ProductionBatchesTable />
    </Stack>
  );
}