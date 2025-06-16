// client/src/app/dashboard/nursery-definitions/plant-types/page.tsx
'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

// Bu bileşenleri birazdan oluşturacağız
import { PlantTypesTable } from '@/components/dashboard/nursery/plant-types-table';
import { PlantTypeCreateForm } from '@/components/dashboard/nursery/plant-type-create-form';
import { PlantTypeEditForm } from '@/components/dashboard/nursery/plant-type-edit-form';

import type { PlantType } from '@/types/nursery';
import { useUser } from '@/hooks/use-user';

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [plantTypes, setPlantTypes] = React.useState<PlantType[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState<boolean>(false);
  const [isEditFormOpen, setIsEditFormOpen] = React.useState<boolean>(false);
  const [selectedPlantType, setSelectedPlantType] = React.useState<PlantType | null>(null);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = React.useState<PlantType | null>(null);

  const fetchPlantTypes = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum tokenı bulunamadı.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plant-types`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fidan türleri alınamadı.');
      }
      const data = await response.json();
      setPlantTypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPlantTypes();
  }, [fetchPlantTypes]);

  const handleOpenCreateForm = () => setIsCreateFormOpen(true);
  const handleCloseCreateForm = () => setIsCreateFormOpen(false);

  const handleOpenEditForm = (plantType: PlantType) => {
    setSelectedPlantType(plantType);
    setIsEditFormOpen(true);
  };
  const handleCloseEditForm = () => {
    setSelectedPlantType(null);
    setIsEditFormOpen(false);
  };

  const handleOpenConfirmDelete = (plantType: PlantType) => {
    setItemToDelete(plantType);
    setIsConfirmDeleteOpen(true);
  };

  const handleCloseConfirmDelete = () => {
    setItemToDelete(null);
    setIsConfirmDeleteOpen(false);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum tokenı bulunamadı.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plant-types/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Silme işlemi başarısız.');
      }
      
      handleSuccess(); // Listeyi yenile
      handleCloseConfirmDelete(); // Modalı kapat
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme sırasında bir hata oluştu.');
    }
  };

  const handleSuccess = () => {
    fetchPlantTypes();
    handleCloseCreateForm();
    handleCloseEditForm();
  };

  const isUserAdmin = currentUser?.roles?.some(role => role.name === 'Yönetici');

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Fidan Türleri</Typography>
        </Stack>
        {isUserAdmin && (
          <div>
            <Button
              startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
              variant="contained"
              onClick={handleOpenCreateForm}
            >
              Yeni Tür Ekle
            </Button>
          </div>
        )}
      </Stack>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <PlantTypesTable
          rows={plantTypes}
          onEdit={handleOpenEditForm}
          onDelete={handleOpenConfirmDelete}
        />
      )}
      
      {isUserAdmin && (
        <>
          <PlantTypeCreateForm
            open={isCreateFormOpen}
            onClose={handleCloseCreateForm}
            onSuccess={handleSuccess}
          />
          {selectedPlantType && (
            <PlantTypeEditForm
              open={isEditFormOpen}
              onClose={handleCloseEditForm}
              onSuccess={handleSuccess}
              plantType={selectedPlantType}
            />
          )}
          <Dialog open={isConfirmDeleteOpen} onClose={handleCloseConfirmDelete}>
            <DialogTitle>Fidan Türünü Sil</DialogTitle>
            <DialogContent>
              <DialogContentText>
                "{itemToDelete?.name}" türünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseConfirmDelete}>İptal</Button>
              <Button onClick={handleDelete} color="error">Sil</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Stack>
  );
}