// GÜNCELLENEN DOSYA YOLU: client/src/components/dashboard/warehouse/warehouses-table.tsx
'use client';

import * as React from 'react';
import { Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Stack, Typography, Button } from '@mui/material';
import type { Warehouse } from '@/types/nursery';

interface WarehousesTableProps {
  rows?: Warehouse[];
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouseId: string) => void;
}

export function WarehousesTable({ rows = [], onEdit, onDelete }: WarehousesTableProps): React.JSX.Element {
    if (rows.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Henüz depo oluşturulmamış.</Typography>
      </Card>
    );
  }
  
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Depo Adı</TableCell>
              <TableCell>Adres</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={row.id}>
                <TableCell>
                  <Typography variant="subtitle2">{row.name}</Typography>
                </TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {/* --- DEĞİŞİKLİK BURADA --- */}
                    <Button variant="outlined" size="small" onClick={() => onEdit(row)}>
                      Düzenle
                    </Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => onDelete(row.id)}>
                      Sil
                    </Button>
                     {/* --- DEĞİŞİKLİK SONU --- */}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}