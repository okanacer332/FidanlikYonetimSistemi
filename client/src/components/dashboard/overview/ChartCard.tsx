'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';

export interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps): React.JSX.Element {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={title} />
      <Divider />
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}