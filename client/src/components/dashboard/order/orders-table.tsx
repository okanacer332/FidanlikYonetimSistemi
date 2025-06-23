'use client';

import * as React from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Stack, Chip,
  Typography, IconButton, Tooltip
} from '@mui/material';
import { Truck as TruckIcon, Receipt as ReceiptIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';

import type { OrderStatus } from '@/types/nursery';

export interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  warehouseName: string;
  totalAmount: number;
  status: OrderStatus;
  orderDate: string;
  isBilled: boolean; // Siparişin faturalanıp faturalanmadığı bilgisi
}

interface OrdersTableProps {
  rows?: OrderRow[];
  onUpdateStatus: (orderId: string, currentStatus: OrderRow['status']) => void;
  canUpdateStatus: boolean;
  onInvoice: (orderId: string) => void;
  canInvoice: boolean;
}

export function OrdersTable({ rows = [], onUpdateStatus, canUpdateStatus, onInvoice, canInvoice }: OrdersTableProps): React.JSX.Element {
  if (rows.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Görüntülenecek sipariş bulunamadı.</Typography>
      </Card>
    );
  }

  const statusMap = {
    PREPARING: { label: 'Hazırlanıyor', color: 'warning' },
    SHIPPED: { label: 'Sevk Edildi', color: 'info' },
    DELIVERED: { label: 'Teslim Edildi', color: 'success' },
    CANCELED: { label: 'İptal Edildi', color: 'error' },
  } as const;

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Sipariş No</TableCell>
              <TableCell>Müşteri</TableCell>
              <TableCell>Depo</TableCell>
              <TableCell>Sipariş Tarihi</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="right">Toplam Tutar</TableCell>
              <TableCell align="center">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const statusInfo = statusMap[row.status] || { label: 'Bilinmiyor', color: 'default' as const };
              const isActionable = row.status === 'PREPARING' || row.status === 'SHIPPED';
              const isCanceled = row.status === 'CANCELED';

              return (
                <TableRow hover key={row.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{row.orderNumber}</Typography>
                  </TableCell>
                  <TableCell>{row.customerName}</TableCell>
                  <TableCell>{row.warehouseName}</TableCell>
                  <TableCell>{dayjs(row.orderDate).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={statusInfo.label} color={statusInfo.color} size="small" variant="outlined"/>
                      {row.isBilled && <Chip label="Faturalandı" color="primary" size="small" />}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    {Number(row.totalAmount || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0} justifyContent="center">
                        <Tooltip title="Sipariş Durumunu Güncelle">
                            <span>
                               <IconButton onClick={() => onUpdateStatus(row.id, row.status)} disabled={!isActionable || !canUpdateStatus}>
                                  <TruckIcon />
                               </IconButton>
                            </span>
                        </Tooltip>
                        {canInvoice && (
                            <Tooltip title={row.isBilled ? "Bu sipariş zaten faturalandırılmış" : "Faturalaştır"}>
                                <span>
                                    <IconButton onClick={() => onInvoice(row.id)} disabled={row.isBilled || isCanceled}>
                                        <ReceiptIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}
