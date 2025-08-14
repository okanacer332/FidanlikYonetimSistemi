'use client';

import * as React from 'react';
import { Avatar, Card, CardContent, Stack, Typography } from '@mui/material';

export interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  iconColor?: string;
}

export function StatCard({ icon: Icon, title, value, iconColor = 'primary.main' }: StatCardProps): React.JSX.Element {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: iconColor, height: '56px', width: '56px' }}>
            <Icon size={32} />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}