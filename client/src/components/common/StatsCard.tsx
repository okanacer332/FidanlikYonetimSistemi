// src/components/common/StatsCard.tsx
import * as React from 'react';
import { Avatar, Card, CardContent, Stack, Typography } from '@mui/material';

// Bileşenimizin alacağı propları tanımlıyoruz.
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode; // İkonu bir React bileşeni olarak alacağız.
  sx?: object; // Dışarıdan ek stil vermek için sx prop'u
}

export function StatsCard({ title, value, icon, sx }: StatsCardProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={3}>
          {/* Üst kısım: Başlık ve İkon */}
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                {title}
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
              {icon}
            </Avatar>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}