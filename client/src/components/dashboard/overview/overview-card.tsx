import * as React from 'react';
import { Avatar, Card, CardContent, Stack, Typography } from '@mui/material';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

interface OverviewCardProps {
  title: string;
  value: string;
  icon: PhosphorIcon;
  color?: string;
}

export function OverviewCard({ title, value, icon: Icon, color = 'primary.main' }: OverviewCardProps): React.JSX.Element {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: color, height: '56px', width: '56px' }}>
            <Icon fontSize="var(--icon-fontSize-lg)" />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
