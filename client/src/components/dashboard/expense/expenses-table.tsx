'use client';

import * as React from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Stack, Chip,
  Typography, IconButton, Tooltip
} from '@mui/material';
import { PencilSimple as PencilSimpleIcon } from '@phosphor-icons/react'; // Edit icon for future use, assuming you might add edit functionality
import dayjs from 'dayjs';

// Expense ve ExpenseCategory tiplerini projenizin types/nursery.ts dosyasından import ettiğinizden emin olun.
// Örneğin: import type { Expense, ExpenseCategory } from '@/types/nursery';
// Eğer bu import satırı henüz yoksa, projenizin mevcut yapısına göre ekleyin.
import type { Expense, ExpenseCategory } from '@/types/nursery';

// ExpensesTableProps arayüzü güncellendi
interface ExpensesTableProps {
  rows: Expense[]; // 'rows' prop'u eklendi
  categories: ExpenseCategory[]; // 'categories' prop'u eklendi
}

export function ExpensesTable({ rows, categories }: ExpensesTableProps): React.JSX.Element {
  // Kategori adlarını hızlıca bulmak için bir Map oluşturalım
  const categoryMap = React.useMemo(() => {
    return new Map(categories.map(category => [category.id, category.name]));
  }, [categories]);

  if (rows.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Görüntülenecek gider kaydı bulunamadı.</Typography>
      </Card>
    );
  }

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Açıklama</TableCell>
              <TableCell>Tutar</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>Ödeme Yöntemi</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const categoryName = categoryMap.get(row.category.id) || 'Bilinmeyen Kategori'; // Kategori adını bul
              const paymentMethodLabel = row.paymentMethod === 'CASH' ? 'Nakit' : row.paymentMethod === 'BANK_TRANSFER' ? 'Banka Transferi' : 'Kredi Kartı'; // Ödeme yöntemi etiketini belirle

              return (
                <TableRow hover key={row.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{row.description}</Typography>
                  </TableCell>
                  <TableCell>
                    {/* Tutarı TR para birimi formatında gösterelim */}
                    {Number(row.amount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </TableCell>
                  <TableCell>{categoryName}</TableCell>
                  <TableCell>{dayjs(row.expenseDate).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>
                    <Chip label={paymentMethodLabel} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    {/* İleride düzenleme butonu eklenebilir */}
                    <Tooltip title="Düzenle">
                      <IconButton>
                        <PencilSimpleIcon />
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
