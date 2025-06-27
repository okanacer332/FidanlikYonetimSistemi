'use client';

import * as React from 'react';
import { Box, Card, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography, Chip } from '@mui/material';
import { PencilSimple as PencilSimpleIcon, Trash as TrashIcon, MinusCircle as MinusCircleIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import type { ProductionBatch } from '@/types/nursery';

dayjs.locale('tr');

interface ProductionBatchesTableProps {
  rows: ProductionBatch[];
  onRecordWastage: (batch: ProductionBatch) => void;
  onEdit: (batch: ProductionBatch) => void; // Yeni prop
  onDelete: (id: string) => void; // Yeni prop
}

const currencyFormatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

export function ProductionBatchesTable({ rows, onRecordWastage, onEdit, onDelete }: ProductionBatchesTableProps): React.JSX.Element {
    return (
        <Card>
            <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 1200 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Parti Kodu</TableCell>
                            <TableCell>Fidan Adı</TableCell>
                            <TableCell>Oluşturma Tarihi</TableCell>
                            <TableCell align="right">Mevcut Miktar</TableCell>
                            <TableCell align="right">Anlık Birim Maliyet</TableCell>
                            <TableCell align="center">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow hover key={row.id}>
                                <TableCell>
                                    <Typography variant="subtitle2">{row.batchCode || row.batchName}</Typography>
                                </TableCell>
                                <TableCell>{row.plantName || 'Yükleniyor...'}</TableCell>
                                <TableCell>{dayjs(row.birthDate).format('DD MMMM YYYY')}</TableCell>
                                <TableCell align="right">
                                    <Chip label={row.currentQuantity} color="success" size="small" />
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        {currencyFormatter.format(row.unitCost)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Düzenle">
                                        <IconButton onClick={() => onEdit(row)}>
                                            <PencilSimpleIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Zayiat / Fire Bildir">
                                        <span>
                                            <IconButton 
                                                color="warning" 
                                                onClick={() => onRecordWastage(row)}
                                                disabled={row.currentQuantity === 0}
                                            >
                                                <MinusCircleIcon />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                     <Tooltip title="Partiyi Sil">
                                        <IconButton color="error" onClick={() => onDelete(row.id)}>
                                            <TrashIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </Card>
    );
}