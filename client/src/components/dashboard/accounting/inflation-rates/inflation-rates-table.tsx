'use client';

import * as React from 'react';
import {
  Box, Card, Divider, Stack, Table, TableBody, TableCell, TableHead,
  TableRow, Typography, Tooltip, IconButton,
} from '@mui/material';
import {
    PencilSimple as PencilSimpleIcon,
    Trash as TrashIcon,
} from '@phosphor-icons/react';

import type { InflationRate } from '@/types/nursery';

interface InflationRatesTableProps {
  rows?: InflationRate[];
  onEdit?: (rate: InflationRate) => void;
  onDelete?: (rateId: string) => void;
}

export function InflationRatesTable({ rows = [], onEdit, onDelete }: InflationRatesTableProps): React.JSX.Element {
  if (rows.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Henüz enflasyon oranı girilmemiş.</Typography>
      </Card>
    );
  }

  const showActionsColumn = onEdit || onDelete;

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '600px' }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Yıl</TableCell>
              <TableCell>Ay</TableCell>
              <TableCell align="right">Oran (%)</TableCell>
              {showActionsColumn && <TableCell align="center">İşlemler</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={row.id}>
                <TableCell>{row.year}</TableCell>
                <TableCell>{row.month}</TableCell>
                <TableCell align="right">{row.rate.toFixed(3)}%</TableCell>
                {showActionsColumn && (
                  <TableCell align="center" sx={{p: 0}}>
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      {onEdit && (<Tooltip title="Düzenle"><IconButton onClick={() => onEdit(row)}><PencilSimpleIcon /></IconButton></Tooltip>)}
                      {onDelete && (<Tooltip title="Sil"><IconButton color="error" onClick={() => onDelete(row.id)}><TrashIcon /></IconButton></Tooltip>)}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      {/* Şimdilik sayfalama gerekli değil, ancak gerekirse eklenebilir */}
      {/* <Divider />
      <TablePagination
        component="div"
        count={rows.length}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
        page={0}
        rowsPerPage={10}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Sayfa başına satır:"
      /> */}
    </Card>
  );
}