'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { Plant } from '@/types/nursery';
import { useUser } from '@/hooks/use-user';

interface PlantsTableProps {
  rows?: Plant[];
  onEdit?: (plant: Plant) => void;
  onDelete?: (plant: Plant) => void;
}

export function PlantsTable({ rows = [], onEdit, onDelete }: PlantsTableProps): React.JSX.Element {
  const { user: currentUser } = useUser();
  const isUserAdmin = currentUser?.roles?.some(role => role.name === 'Yönetici');

  if (rows.length === 0) {
    return (
      <Card sx={{p: 3, textAlign: 'center'}}>
        <Typography color="text.secondary">Henüz fidan kimliği oluşturulmamış.</Typography>
      </Card>
    );
  }

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Fidan Türü</TableCell>
              <TableCell>Fidan Çeşidi</TableCell>
              <TableCell>Anaç</TableCell>
              <TableCell>Boy</TableCell>
              <TableCell>Yaş</TableCell>
              {isUserAdmin && <TableCell align="right">İşlemler</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={row.id}>
                {/* DBRef ile gelen iç içe nesnelerden verileri güvenli bir şekilde alıyoruz (?.) */}
                <TableCell>{row.plantType?.name || 'N/A'}</TableCell>
                <TableCell>{row.plantVariety?.name || 'N/A'}</TableCell>
                <TableCell>{row.rootstock?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Chip label={row.plantSize?.name || 'N/A'} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip label={row.plantAge?.name || 'N/A'} size="small" variant="outlined" />
                </TableCell>
                {isUserAdmin && (
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => onEdit?.(row)}
                        disabled={!onEdit} // Prop gelmediyse butonu pasif yap
                      >
                        Düzenle
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small" 
                        onClick={() => onDelete?.(row)}
                        disabled={!onDelete} // Prop gelmediyse butonu pasif yap
                      >
                        Sil
                      </Button>
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}