/*
 * ----------------------------------------------------------------------
 * YENİ DOSYA veya GÜNCELLENECEK DOSYA: 
 * client/src/components/dashboard/overview/top-selling-plants.tsx
 * ----------------------------------------------------------------------
 */

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import type { SxProps } from '@mui/material/styles';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';

export interface TopPlant {
  name: string;
  quantity: number;
}

export interface TopSellingPlantsProps {
  plants?: TopPlant[];
  sx?: SxProps;
}

// DÜZELTME: 'export' ifadesi eklendi ve boş liste durumu için bir mesaj eklendi.
export const TopSellingPlants = ({ plants = [], sx }: TopSellingPlantsProps): React.JSX.Element => {
  return (
    <Card sx={sx}>
      <CardHeader title="En Çok Satan Fidanlar" />
      <Divider />
      {plants.length > 0 ? (
        <List disablePadding>
          {plants.map((plant, index) => (
            <ListItem divider={index < plants.length - 1} key={plant.name}>
              <ListItemText
                primary={plant.name}
                primaryTypographyProps={{ variant: 'subtitle1' }}
              />
              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                {plant.quantity} adet
              </Typography>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">Satış verisi bulunamadı.</Typography>
        </Box>
      )}
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
        >
          Tüm Raporlar
        </Button>
      </CardActions>
    </Card>
  );
};


/*
 * ----------------------------------------------------------------------
 * GÜNCELLENECEK DOSYA: 
 * client/src/components/dashboard/overview/total-customers.tsx
 * ----------------------------------------------------------------------
 */

import Avatar from '@mui/material/Avatar';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import CardContent from '@mui/material/CardContent';
import { Stack } from '@mui/system';

export interface TotalCustomersProps {
  diff?: number;
  trend?: 'up' | 'down'; // DÜZELTME: Zorunlu olmaktan çıkarıldı.
  sx?: SxProps;
  value: string;
}

export function TotalCustomers({ diff, trend, sx, value }: TotalCustomersProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Toplam Müşteri
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-success-main)', height: '56px', width: '56px' }}>
              <UsersIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          {/* DÜZELTME: Sadece trend ve diff varsa göster */}
          {diff && trend ? (
            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
              <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                <TrendIcon color={trendColor} fontSize="var(--icon-fontSize-md)" />
                <Typography color={trendColor} variant="body2">
                  {diff}%
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="caption">
                geçen aydan beri
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

