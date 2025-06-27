'use client';

import * as React from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Typography, CardHeader, Divider, Tooltip
} from '@mui/material';
import dayjs from 'dayjs';
import type { RealProfitabilityReportDto } from '@/types/nursery';

interface RealProfitabilityTableProps {
  data: RealProfitabilityReportDto[];
}

const currencyFormatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

const renderProfitCell = (profit: number) => {
    const color = profit >= 0 ? 'success.main' : 'error.main';
    return <Typography color={color} sx={{ fontWeight: 'bold' }}>{currencyFormatter.format(profit)}</Typography>
}

export function RealProfitabilityTable({ data = [] }: RealProfitabilityTableProps): React.JSX.Element {
  if (data.length === 0) {
      return (
          <Card>
              <CardHeader title="Reel Karlılık Raporu Sonuçları"/>
              <Divider/>
              <Typography color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
                  Görüntülenecek veri bulunamadı. Lütfen tarih aralığı seçip "Raporu Getir" butonuna tıklayın.
              </Typography>
          </Card>
      )
  }

  return (
    <Card>
      <CardHeader title="Reel Karlılık Raporu Sonuçları"/>
      <Divider/>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1200 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Sipariş No</TableCell>
              <TableCell>Satış Tarihi</TableCell>
              <TableCell>Fidan Adı</TableCell>
              <TableCell align="right">Miktar</TableCell>
              <TableCell align="right">Birim Satış Fiyatı</TableCell>
              <TableCell align="right">Toplam Hasılat</TableCell>
              <TableCell align="right">
                <Tooltip title="Satış anındaki anlık birim maliyet">
                  <span>Nominal Birim Maliyet</span>
                </Tooltip>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Satış anındaki enflasyona göre düzeltilmiş reel birim maliyet">
                  <span>Reel Birim Maliyet</span>
                </Tooltip>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Enflasyonun maliyete etkisi">
                  <span>Enflasyon Farkı</span>
                </Tooltip>
              </TableCell>
              <TableCell align="right">Nominal Kâr</TableCell>
              <TableCell align="right">Reel Kâr</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow hover key={row.orderId + row.plantId}>
                <TableCell>{row.orderNumber}</TableCell>
                <TableCell>{dayjs(row.saleDate).format('DD.MM.YYYY')}</TableCell>
                <TableCell><Typography variant="subtitle2">{row.plantName}</Typography></TableCell>
                <TableCell align="right">{row.quantitySold}</TableCell>
                <TableCell align="right">{currencyFormatter.format(row.salePrice)}</TableCell>
                <TableCell align="right">{currencyFormatter.format(row.totalRevenue)}</TableCell>
                <TableCell align="right">{currencyFormatter.format(row.nominalUnitCost)}</TableCell>
                <TableCell align="right">{currencyFormatter.format(row.realUnitCost)}</TableCell>
                <TableCell align="right" sx={{color: 'warning.main'}}>{currencyFormatter.format(row.inflationDifference)}</TableCell>
                <TableCell align="right">{renderProfitCell(row.nominalProfit)}</TableCell>
                <TableCell align="right">{renderProfitCell(row.realProfit)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}