import * as React from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

import type { InflationData } from '@/types/inflation';

interface InflationTableProps {
  rows: InflationData[];
}

export function InflationDataTable({ rows }: InflationTableProps): React.JSX.Element {
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Tarih</TableCell>
              <TableCell>Seri Adı</TableCell>
              <TableCell>Değer (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    Görüntülenecek veri bulunamadı.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {format(new Date(row.date), 'MMMM yyyy', { locale: tr })}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.seriesName}</TableCell>
                  <TableCell>{row.value.toFixed(4)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}