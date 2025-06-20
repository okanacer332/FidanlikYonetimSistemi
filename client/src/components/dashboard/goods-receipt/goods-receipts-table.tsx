'use client';

import * as React from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Stack, Chip,
  Typography, IconButton, Tooltip
} from '@mui/material';
import { XCircle as XCircleIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';

// This type definition is used to structure the data for display in the table
export interface GoodsReceiptRow {
  id: string;
  receiptNumber: string;
  supplierName: string;
  warehouseName: string;
  totalValue: number;
  status: 'COMPLETED' | 'CANCELED';
  receiptDate: string;
}

interface GoodsReceiptsTableProps {
  rows?: GoodsReceiptRow[];
  onCancel: (receiptId: string) => void;
  canCancel: boolean; // Prop to control if the cancel button is shown
}

export function GoodsReceiptsTable({ rows = [], onCancel, canCancel }: GoodsReceiptsTableProps): React.JSX.Element {
  if (rows.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Görüntülenecek mal giriş kaydı bulunamadı.</Typography>
      </Card>
    );
  }

  const statusMap = {
    COMPLETED: { label: 'Tamamlandı', color: 'success' },
    CANCELED: { label: 'İptal Edildi', color: 'error' },
  } as const;

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>İrsaliye No</TableCell>
              <TableCell>Tedarikçi</TableCell>
              <TableCell>Giriş Deposu</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="right">Toplam Değer</TableCell>
              {canCancel && <TableCell align="center">İşlemler</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const statusInfo = statusMap[row.status] || { label: 'Bilinmiyor', color: 'default' as const };
              const isCanceled = row.status === 'CANCELED';

              return (
                <TableRow hover key={row.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{row.receiptNumber}</Typography>
                  </TableCell>
                  <TableCell>{row.supplierName}</TableCell>
                  <TableCell>{row.warehouseName}</TableCell>
                  <TableCell>{dayjs(row.receiptDate).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell>
                    <Chip label={statusInfo.label} color={statusInfo.color} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    {/* UPDATED: Explicitly convert to a Number before formatting */}
                    {Number(row.totalValue || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </TableCell>
                  {canCancel && (
                    <TableCell align="center">
                      <Tooltip title={isCanceled ? "Bu kayıt zaten iptal edilmiş" : "Girişi İptal Et"}>
                        <span>
                          <IconButton 
                            color="error" 
                            onClick={() => onCancel(row.id)} 
                            disabled={isCanceled}
                          >
                            <XCircleIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}