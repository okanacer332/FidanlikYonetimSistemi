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
import type { PlantType } from '@/types/nursery';
import { useUser } from '@/hooks/use-user';

interface PlantTypesTableProps {
  rows?: PlantType[];
  onEdit: (plantType: PlantType) => void;
  onDelete: (plantType: PlantType) => void;
}

export function PlantTypesTable({ rows = [], onEdit, onDelete }: PlantTypesTableProps): React.JSX.Element {
  const { user: currentUser } = useUser();
  const isUserAdmin = currentUser?.roles?.some(role => role.name === 'Yönetici');

  return (
    <Card>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Fidan Türü Adı</TableCell>
            {isUserAdmin && <TableCell align="right">İşlemler</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow hover key={row.id}>
              <TableCell>{row.name}</TableCell>
              {isUserAdmin && (
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button variant="outlined" size="small" onClick={() => onEdit(row)}>
                      Düzenle
                    </Button>
                    <Button variant="outlined" color="error" size="small" onClick={() => onDelete(row)}>
                      Sil
                    </Button>
                  </Stack>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}