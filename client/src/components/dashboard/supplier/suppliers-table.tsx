// client/src/components/dashboard/supplier/suppliers-table.tsx
'use client';

import * as React from 'react';
import { Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Stack, Typography, Button } from '@mui/material';
import type { Supplier } from '@/types/nursery';

interface SuppliersTableProps {
  rows?: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplierId: string) => void;
}

export function SuppliersTable({ rows = [], onEdit, onDelete }: SuppliersTableProps): React.JSX.Element {
    if (rows.length === 0) {
        return (
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">Henüz tedarikçi oluşturulmamış.</Typography>
          </Card>
        );
    }

    return (
        <Card>
            <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: '800px' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tedarikçi Adı</TableCell>
                            <TableCell>Yetkili Kişi</TableCell>
                            <TableCell>Telefon</TableCell>
                            <TableCell>E-posta</TableCell>
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
                                <TableCell>{row.contactPerson}</TableCell>
                                <TableCell>{row.phone}</TableCell>
                                <TableCell>{row.email}</TableCell>
                                <TableCell>{row.address}</TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Button variant="outlined" size="small" onClick={() => onEdit(row)}>
                                            Düzenle
                                        </Button>
                                        <Button variant="outlined" size="small" color="error" onClick={() => onDelete(row.id)}>
                                            Sil
                                        </Button>
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