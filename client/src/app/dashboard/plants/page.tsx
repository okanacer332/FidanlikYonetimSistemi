'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

import type { Plant } from '@/types/nursery';
import { PlantCreateForm } from '@/components/dashboard/nursery/plant-create-form';
import { PlantEditForm } from '@/components/dashboard/nursery/plant-edit-form';
import { PlantsTable } from '@/components/dashboard/nursery/plants-table';
import { useUser } from '@/hooks/use-user';

export default function Page(): React.JSX.Element {
    const { user: currentUser } = useUser();
    const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
    const [isEditModalOpen, setEditModalOpen] = React.useState(false);
    const [selectedPlantToEdit, setSelectedPlantToEdit] = React.useState<Plant | null>(null);
    const [plants, setPlants] = React.useState<Plant[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState<boolean>(false);
    const [plantToDeleteId, setPlantToDeleteId] = React.useState<string | null>(null);
    const [deleteError, setDeleteError] = React.useState<string | null>(null);

    // UPDATED: Check for standardized role names
    const canCreatePlant = currentUser?.roles?.some(role =>
        role.name === 'ADMIN' || role.name === 'SALES'
    );
    const canEditPlants = currentUser?.roles?.some(role =>
        role.name === 'ADMIN'
    );
    const canDeletePlants = currentUser?.roles?.some(role =>
        role.name === 'ADMIN'
    );
    const canListPlants = currentUser?.roles?.some(role =>
        role.name === 'ADMIN' || role.name === 'SALES' || role.name === 'WAREHOUSE_STAFF'
    );

    const fetchPlants = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Fidan kimlikleri yüklenemedi.');
            }
            const data = await response.json();
            setPlants(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (canListPlants) {
            fetchPlants();
        } else {
            setLoading(false);
            setError('Fidan kimliklerini listeleme yetkiniz bulunmamaktadır.');
        }
    }, [fetchPlants, canListPlants]);

    const handleCreateSuccess = () => {
        setCreateModalOpen(false);
        fetchPlants();
    };

    const handleEditClick = (plant: Plant) => {
        setSelectedPlantToEdit(plant);
        setEditModalOpen(true);
    };

    const handleEditSuccess = () => {
        setEditModalOpen(false);
        setSelectedPlantToEdit(null);
        fetchPlants();
    };

    const handleEditClose = () => {
        setEditModalOpen(false);
        setSelectedPlantToEdit(null);
    };

    const handleDeleteClick = (plantId: string) => {
        setPlantToDeleteId(plantId);
        setIsConfirmDeleteOpen(true);
        setDeleteError(null);
    };

    const handleConfirmDelete = React.useCallback(async () => {
        if (!plantToDeleteId) return;
        setDeleteError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants/${plantToDeleteId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Fidan kimliği silinemedi.');
            }
            fetchPlants();
            setIsConfirmDeleteOpen(false);
            setPlantToDeleteId(null);
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Silme işlemi sırasında bir hata oluştu.');
        }
    }, [plantToDeleteId, fetchPlants]);

    const handleCloseDeleteConfirm = () => {
        setIsConfirmDeleteOpen(false);
        setPlantToDeleteId(null);
        setDeleteError(null);
    };

    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={3}>
                <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                    <Typography variant="h4">Fidan Kimlikleri</Typography>
                    <Typography variant="body1">
                        Sistemde kayıtlı tüm fidan kombinasyonlarını yönetebilirsiniz.
                    </Typography>
                </Stack>
                <div>
                    {canCreatePlant && (
                        <Button
                            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                            variant="contained"
                            onClick={() => setCreateModalOpen(true)}
                        >
                            Yeni Fidan Kimliği Ekle
                        </Button>
                    )}
                </div>
            </Stack>

            <PlantCreateForm
                open={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            {canEditPlants && (
                <PlantEditForm
                    open={isEditModalOpen}
                    onClose={handleEditClose}
                    onSuccess={handleEditSuccess}
                    plant={selectedPlantToEdit}
                />
            )}

            {loading ? (
                <Stack sx={{ alignItems: 'center', mt: 3 }}><CircularProgress /></Stack>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            ) : (
                <PlantsTable
                    rows={plants}
                    onEdit={canEditPlants ? handleEditClick : undefined}
                    onDelete={canDeletePlants ? handleDeleteClick : undefined}
                />
            )}

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
        </Stack>
    );
}