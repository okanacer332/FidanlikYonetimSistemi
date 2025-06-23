'use client';

import * as React from 'react';
import {
  Box,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Eye as EyeIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';

// DÜZELTME: 'InvoiceStatus' bir değer olarak import edildi, 'Invoice' ise tip olarak kaldı.
import { type Invoice, InvoiceStatus } from '@/types/nursery';

export interface InvoiceRow extends Invoice {
  customerName: string;
}

interface InvoicesTableProps {
  rows?: InvoiceRow[];
}

export function InvoicesTable({ rows = [] }: InvoicesTableProps): React.JSX.Element {
  if (rows.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Görüntülenecek fatura bulunamadı.</Typography>
      </Card>
    );
  }

  const statusMap: Record<InvoiceStatus, { label: string; color: 'primary' | 'success' | 'warning' | 'error' }> = {
    [InvoiceStatus.DRAFT]: { label: 'Taslak', color: 'warning' },
    [InvoiceStatus.PAID]: { label: 'Ödendi', color: 'success' },
    [InvoiceStatus.SENT]: { label: 'Gönderildi', color: 'primary' },
    [InvoiceStatus.CANCELED]: { label: 'İptal Edildi', color: 'error' },
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '1000px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Fatura No</TableCell>
              <TableCell>Müşteri</TableCell>
              <TableCell>Düzenlenme Tarihi</TableCell>
              <TableCell>Vade Tarihi</TableCell>
              <TableCell align="right">Tutar</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="center">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const statusInfo = statusMap[row.status] || { label: 'Bilinmiyor', color: 'default' as const };
              return (
                <TableRow hover key={row.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{row.invoiceNumber}</Typography>
                  </TableCell>
                  <TableCell>{row.customerName}</TableCell>
                  <TableCell>{dayjs(row.issueDate).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>{dayjs(row.dueDate).format('DD/MM/YYYY')}</TableCell>
                  <TableCell align="right">
                    {row.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </TableCell>
                  <TableCell>
                    <Chip label={statusInfo.label} color={statusInfo.color} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Faturayı Görüntüle">
                      <IconButton onClick={() => { /* TODO: Fatura detay sayfasına yönlendir */ }}>
                        <EyeIcon />
                      </IconButton>
                    </Tooltip>
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
