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
} from '@mui/material';
import dayjs from 'dayjs';
import { ArrowCircleUpRight as IncomeIcon, ArrowCircleDownLeft as ExpenseIcon } from '@phosphor-icons/react';

// DÜZELTME: Hem değer hem de tip olarak kullanılacak enum'lar 'type' olmadan import edildi.
import { type Payment, PaymentType, PaymentMethod, type RelatedEntityType } from '@/types/nursery';

export interface PaymentRow {
    id: string;
    paymentDate: string;
    type: PaymentType;
    method: PaymentMethod;
    amount: number;
    description: string;
    relatedEntityType: RelatedEntityType;
    relatedName: string; // Müşteri veya Tedarikçi Adı
}

interface PaymentsTableProps {
  rows?: PaymentRow[];
}

export function PaymentsTable({ rows = [] }: PaymentsTableProps): React.JSX.Element {
  if (rows.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Görüntülenecek ödeme hareketi bulunamadı.</Typography>
      </Card>
    );
  }

  const typeMap: Record<PaymentType, { label: string; color: 'success' | 'error'; icon: React.ElementType }> = {
    [PaymentType.COLLECTION]: { label: 'Tahsilat', color: 'success', icon: IncomeIcon },
    [PaymentType.PAYMENT]: { label: 'Tediye', color: 'error', icon: ExpenseIcon },
  };

  const methodMap: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: 'Nakit',
    [PaymentMethod.BANK_TRANSFER]: 'Banka Transferi',
    [PaymentMethod.CREDIT_CARD]: 'Kredi Kartı',
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '1000px' }}>
          <TableHead>
            <TableRow>
              <TableCell>İşlem Tarihi</TableCell>
              <TableCell>İşlem Tipi</TableCell>
              <TableCell>İlişkili Taraf</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>Ödeme Yöntemi</TableCell>
              <TableCell align="right">Tutar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const typeInfo = typeMap[row.type];
              return (
                <TableRow hover key={row.id}>
                  <TableCell>{dayjs(row.paymentDate).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>
                     <Chip
                        icon={<typeInfo.icon style={{ fontSize: '1.2em' }} />}
                        label={typeInfo.label}
                        color={typeInfo.color}
                        size="small"
                        variant="outlined"
                      />
                  </TableCell>
                  <TableCell>
                     <Typography variant="subtitle2">{row.relatedName}</Typography>
                     <Typography variant="caption" color="text.secondary">
                        {row.relatedEntityType === 'CUSTOMER' ? 'Müşteri' : 'Tedarikçi'}
                     </Typography>
                  </TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>{methodMap[row.method]}</TableCell>
                  <TableCell align="right">
                    <Typography color={typeInfo.color === 'success' ? 'success.main' : 'error.main'} fontWeight="bold">
                        {typeInfo.color === 'success' ? '+' : '-'} {row.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </Typography>
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
