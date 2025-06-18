// Dosya Yolu: client/src/components/dashboard/nursery/plants-table.tsx
'use client';

import * as React from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow,
  Button, Stack, Chip, Typography, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Alert
} from '@mui/material';

import type { Plant } from '@/types/nursery';

interface PlantsTableProps {
  rows?: Plant[];
  // DÜZELTME: Props'ları opsiyonel yaptık.
  onEdit?: (plant: Plant) => void;
  onDelete?: (plantId: string) => void;
}

export function PlantsTable({ rows = [], onEdit, onDelete }: PlantsTableProps): React.JSX.Element {
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState<boolean>(false);
  const [plantToDeleteId, setPlantToDeleteId] = React.useState<string | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const handleDeleteClick = (plantId: string) => {
    setPlantToDeleteId(plantId);
    setIsConfirmDeleteOpen(true);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (plantToDeleteId && onDelete) {
      try {
        await onDelete(plantToDeleteId);
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

  // DÜZELTME: "İşlemler" sütununun gösterilip gösterilmeyeceğini kontrol edelim.
  const showActionsColumn = onEdit || onDelete;

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
              {/* DÜZELTME: Sütun sadece yetki varsa gösterilecek */}
              {showActionsColumn && <TableCell align="right">İşlemler</TableCell>}
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
                {/* DÜZELTME: Hücre ve butonlar sadece yetki varsa gösterilecek */}
                {showActionsColumn && (
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {onEdit && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => onEdit(row)}
                        >
                          Düzenle
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(row.id)}
                        >
                          Sil
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Dialog
        open={isConfirmDeleteOpen}
        onClose={handleCloseDeleteConfirm}
        aria-labelledby="confirm-delete-title"
      >
        <DialogTitle id="confirm-delete-title">
          Fidan Kimliğini Silmek İstediğinize Emin Misiniz?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
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