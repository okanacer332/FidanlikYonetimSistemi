'use client';

import * as React from 'react';
import { List, ListItem, ListItemText, Divider, Typography, Box } from '@mui/material';
import type { TopSellingPlantDTO } from '@/types/dashboard';

interface TopSellingPlantsListProps {
  data?: TopSellingPlantDTO[];
}

export function TopSellingPlantsList({ data = [] }: TopSellingPlantsListProps): React.JSX.Element {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">En çok satan fidanlar listesi için yeterli veri bulunamadı.</Typography>
      </Box>
    );
  }

  return (
    <List>
      {data.map((plant, index) => (
        <React.Fragment key={plant.plantName}>
          <ListItem sx={{ py: 1 }}>
            <ListItemText primary={plant.plantName} secondary={`Satış Adedi: ${plant.totalSold}`} />
          </ListItem>
          {index < data.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
}