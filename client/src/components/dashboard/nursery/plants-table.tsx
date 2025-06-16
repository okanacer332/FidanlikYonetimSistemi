// client/src/components/dashboard/nursery/plants-table.tsx
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';

import type { Plant } from '@/types/nursery';
import { useUser } from '@/hooks/use-user';

interface PlantsTableProps {
  rows?: Plant[];
  onEdit?: (plant: Plant) => void;
  onDelete?: (plantId: string) => void; // plantId alacak şekilde güncellendi
}

export function PlantsTable({ rows = [], onEdit, onDelete }: PlantsTableProps): React.JSX.Element {
  const { user: currentUser } = useUser();
  const isUserAdmin = currentUser?.roles?.some(role => role.name === 'Yönetici');

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState<boolean>(false);
  const [plantToDeleteId, setPlantToDeleteId] = React.useState<string | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const handleDeleteClick = (plantId: string) => {
    setPlantToDeleteId(plantId);
    setIsConfirmDeleteOpen(true);
    setDeleteError(null); // Clear previous errors
  };

  const handleConfirmDelete = async () => {
    if (plantToDeleteId && onDelete) {
      try {
        await onDelete(plantToDeleteId); // Callback'i çağır
        setIsConfirmDeleteOpen(false);
        setPlantToDeleteId(null);
      } catch (err) {
        setDeleteError(err instanceof Error ? err.message : 'Silme işlemi sırasında bir hata oluştu.');
      }
    }
  };

  const handleCloseDeleteConfirm = () => {
    setIsConfirmDeleteOpen(false);
    setPlantToDeleteId(null);
    setDeleteError(null);
  };

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
              <TableCell>Arazi</TableCell>
              {isUserAdmin && <TableCell align="right">İşlemler</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={row.id}>
                <TableCell>{row.plantType?.name || 'N/A'}</TableCell>
                <TableCell>{row.plantVariety?.name || 'N/A'}</TableCell>
                <TableCell>{row.rootstock?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Chip label={row.plantSize?.name || 'N/A'} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip label={row.plantAge?.name || 'N/A'} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{row.land?.name || 'N/A'}</TableCell>
                {isUserAdmin && (
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => onEdit?.(row)}
                        disabled={!onEdit}
                      >
                        Düzenle
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(row.id)} // Silme butonu
                        disabled={!onDelete}
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

      {/* Silme Onayı Modalı */}
      <Dialog
        open={isConfirmDeleteOpen}
        onClose={handleCloseDeleteConfirm}
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
      >
        <DialogTitle id="confirm-delete-title">
          {"Fidan Kimliğini Silmek İstediğinize Emin Misiniz?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-delete-description">
            Bu işlem geri alınamaz. Seçilen fidan kimliği kalıcı olarak silinecektir.
          </DialogContentText>
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>İptal</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}