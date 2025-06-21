import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import dayjs from 'dayjs';

// GÜNCELLEME: Backend'den gelebilecek tüm durumlar için bir harita oluşturuldu.
const statusMap = {
  preparing: { label: 'Hazırlanıyor', color: 'warning' },
  shipped: { label: 'Sevk Edildi', color: 'info' },
  delivered: { label: 'Teslim Edildi', color: 'success' },
  canceled: { label: 'İptal Edildi', color: 'error' },
  pending: { label: 'Beklemede', color: 'warning' },
  refunded: { label: 'İade', color: 'error' },
} as const;

export interface Order {
  id: string;
  customer: { name: string };
  amount: number;
  status: keyof typeof statusMap; // GÜNCELLEME: status tipi daha esnek hale getirildi.
  createdAt: Date;
}

export interface LatestOrdersProps {
  orders?: Order[];
  sx?: SxProps;
}

export function LatestOrders({ orders = [], sx }: LatestOrdersProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardHeader title="Son Siparişler" />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Sipariş No</TableCell>
              <TableCell>Müşteri</TableCell>
              <TableCell sortDirection="desc">Tarih</TableCell>
              <TableCell>Durum</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              const { label, color } = statusMap[order.status] ?? { label: 'Bilinmiyor', color: 'default' };

              return (
                <TableRow hover key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell>{dayjs(order.createdAt).format('DD MMM, YYYY')}</TableCell>
                  <TableCell>
                    <Chip color={color} label={label} size="small" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
        >
          Tümünü Gör
        </Button>
      </CardActions>
    </Card>
  );
}