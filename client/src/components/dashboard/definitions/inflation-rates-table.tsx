'use client';

import * as React from 'react';
import { Box, Card, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';
import { PencilSimple as PencilSimpleIcon, Trash as TrashIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import type { InflationRate } from '@/types/nursery';

dayjs.locale('tr');

interface InflationRatesTableProps {
  rows: InflationRate[];
  onEdit: (rate: InflationRate) => void;
  onDelete: (id: string) => void;
}

export function InflationRatesTable({ rows, onEdit, onDelete }: InflationRatesTableProps): React.JSX.Element {
    const monthNames = React.useMemo(() => Array.from({ length: 12 }, (_, i) => dayjs().month(i).format('MMMM')), []);

    return (
        <Card>
            <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Yıl</TableCell>
                            <TableCell>Ay</TableCell>
                            <TableCell>Enflasyon Oranı (%)</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow hover key={row.id}>
                                <TableCell>{row.year}</TableCell>
                                <TableCell>{monthNames[row.month - 1]}</TableCell>
                                <TableCell>{row.rate.toFixed(2)}</TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Düzenle">
                                        <IconButton onClick={() => onEdit(row)}>
                                            <PencilSimpleIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Sil">
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