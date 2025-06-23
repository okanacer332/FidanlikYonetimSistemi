'use client';

import * as React from 'react';
import { Box, Card, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import dayjs from 'dayjs';

import type { Transaction } from '@/types/nursery';

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions = [] }: TransactionTableProps): React.JSX.Element {

  const calculateBalances = (txns: Transaction[]) => {
    let currentBalance = 0;
    const balances: { [id: string]: number } = {};

    // Gelen veriler en yeniden en eskiye sıralı olduğu için tersten başlıyoruz
    for (let i = txns.length - 1; i >= 0; i--) {
      const txn = txns[i];
      if (txn.type === 'DEBIT') {
        currentBalance += txn.amount;
      } else {
        currentBalance -= txn.amount;
      }
      balances[txn.id] = currentBalance;
    }
    return balances;
  };

  const balances = calculateBalances(transactions);

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Tarih</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>İşlem Tipi</TableCell>
              <TableCell align="right">Borç</TableCell>
              <TableCell align="right">Alacak</TableCell>
              <TableCell align="right">Bakiye</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((txn) => {
              const isDebit = txn.type === 'DEBIT';
              return (
                <TableRow hover key={txn.id}>
                  <TableCell>{dayjs(txn.transactionDate).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell>{txn.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={isDebit ? 'Borç' : 'Alacak'}
                      color={isDebit ? 'error' : 'success'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {isDebit ? txn.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {!isDebit ? txn.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {balances[txn.id].toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </TableCell>
                </TableRow>
              );
            })}
             <TableRow sx={{ '& td': { fontWeight: 'bold', borderTop: 2, borderColor: 'divider' } }}>
                <TableCell colSpan={5} align="right">Güncel Bakiye</TableCell>
                <TableCell align="right">
                  {transactions.length > 0 ? balances[transactions[0].id].toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : (0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}