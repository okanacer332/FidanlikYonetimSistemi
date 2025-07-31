'use client';

import * as React from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Typography, Chip, Divider
} from '@mui/material';
import dayjs from 'dayjs';
import type { Expense, ExpenseCategory } from '@/types/expense';

interface BatchExpensesTableProps {
  expenses: Expense[];
  expenseCategoriesMap: Map<string, ExpenseCategory>;
}

export function BatchExpensesTable({ expenses, expenseCategoriesMap }: BatchExpensesTableProps): React.JSX.Element {
  if (expenses.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Bu partiye ait gider bulunamadı.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflowX: 'auto', mt: 3 }}>
      <Table size="small">
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
              <TableCell>{dayjs(expense.expenseDate).format('DD/MM/YYYY')}</TableCell>
              <TableCell>
                {/* Kategori ID'si ile eşleşen kategori ismini göster */}
                <Chip label={expenseCategoriesMap.get(expense.categoryId)?.name || 'Bilinmiyor'} size="small" variant="outlined" />
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
  );
}