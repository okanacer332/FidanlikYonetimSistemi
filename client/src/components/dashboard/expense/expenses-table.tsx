'use client';

import * as React from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Typography, Chip
} from '@mui/material';
import dayjs from 'dayjs';
import type { Expense } from '@/types/nursery';

interface ExpensesTableProps {
  expenses: Expense[];
}

export function ExpensesTable({ expenses = [] }: ExpensesTableProps): React.JSX.Element {
  if (expenses.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Görüntülenecek gider bulunamadı.</Typography>
      </Card>
    );
  }

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Tarih</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell align="right">Tutar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow hover key={expense.id}>
                <TableCell>{dayjs(expense.expenseDat).format('DD/MM/YYYY')}</TableCell>
                <TableCell>
                  <Chip label={expense.category.name} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell align="right">
                  <Typography color="error.main" fontWeight="bold">
                    - {expense.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}
