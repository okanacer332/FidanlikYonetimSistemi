'use client';

import * as React from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CardHeader,
} from '@mui/material';
import type { CustomerSalesReport } from '@/types/nursery';

interface CustomerSalesTableProps {
  data: CustomerSalesReport[];
}

export function CustomerSalesTable({ data = [] }: CustomerSalesTableProps): React.JSX.Element {
    if (data.length === 0) {
        return (
            <Card>
                <CardHeader title="Müşteri Bazında Satışlar"/>
                <Typography color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
                    Raporu oluşturmak için yeterli satış verisi bulunmamaktadır.
                </Typography>
            </Card>
        )
    }

  return (
    <Card>
        <CardHeader title="Müşteri Bazında Satışlar"/>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Müşteri</TableCell>
              <TableCell align="right">Toplam Sipariş Sayısı</TableCell>
              <TableCell align="right">Toplam Satış Tutarı</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow hover key={index}>
                <TableCell>
                  <Typography variant="subtitle2">{row.customerFirstName} {row.customerLastName}</Typography>
                </TableCell>
                <TableCell align="right">{row.orderCount} adet</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {row.totalSalesAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}
