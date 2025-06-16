// client/src/components/dashboard/nursery/plant-types-table.tsx
'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import type { PlantType } from '@/types/nursery';
import { useUser } from '@/hooks/use-user';

interface PlantTypesTableProps {
  rows?: PlantType[];
  onEdit: (plantType: PlantType) => void;
}

export function PlantTypesTable({ rows = [], onEdit }: PlantTypesTableProps): React.JSX.Element {
  const { user: currentUser } = useUser();
  const isUserAdmin = currentUser?.roles?.some(role => role.name === 'Yönetici');

  return (
    <Card>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Fidan Türü Adı</TableCell>
            {isUserAdmin && <TableCell>İşlemler</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow hover key={row.id}>
              <TableCell>{row.name}</TableCell>
              {isUserAdmin && (
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => onEdit(row)}>
                    Düzenle
                  </Button>
                  {/* Silme butonu daha sonra eklenebilir */}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}