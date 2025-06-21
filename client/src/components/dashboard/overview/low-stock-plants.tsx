import React from 'react';
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
import { Warning as WarningIcon } from '@phosphor-icons/react/dist/ssr/Warning';

export interface StockPlant {
  name: string;
  quantity: number;
}

export interface LowStockPlantsProps {
  plants?: StockPlant[];
  sx?: SxProps;
}

export function LowStockPlants({ plants = [], sx }: LowStockPlantsProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardHeader title="Stoku Azalanlar" />
      <Divider />
      <List>
        {plants.map((plant, index) => (
          <ListItem divider={index < plants.length - 1} key={plant.name}>
            <WarningIcon color="var(--mui-palette-warning-main)" style={{ marginRight: '16px' }} />
            <ListItemText
              primary={plant.name}
              primaryTypographyProps={{ variant: 'subtitle1' }}
            />
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
                {plant.quantity} adet kaldı
            </Typography>
          </ListItem>
        ))}
      </List>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
        >
          Stok Raporu
        </Button>
      </CardActions>
    </Card>
  );
}