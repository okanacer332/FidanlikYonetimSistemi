'use client';

import * as React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Hourglass as HourglassIcon } from '@phosphor-icons/react';

interface ComingSoonProps {
  title: string;
}

export function ComingSoon({ title }: ComingSoonProps): React.JSX.Element {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {title}
      </Typography>
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              gap: 2,
              color: 'text.secondary',
            }}
          >
            <HourglassIcon size={48} />
            <Typography variant="h6">Çok Yakında</Typography>
            <Typography variant="body1" sx={{ textAlign: 'center' }}>
              Bu rapor şu anda geliştirme aşamasındadır ve en kısa sürede kullanımınıza sunulacaktır.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}