// client/src/app/dashboard/plants/page.tsx
'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog'; // Import Dialog components for delete confirmation
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

import type { Plant } from '@/types/nursery';
import { PlantCreateForm } from '@/components/dashboard/nursery/plant-create-form';
import { PlantEditForm } from '@/components/dashboard/nursery/plant-edit-form';
import { PlantsTable } from '@/components/dashboard/nursery/plants-table';
import { useUser } from '@/hooks/use-user'; // Import useUser to check roles

export default function Page(): React.JSX.Element {
    const { user: currentUser } = useUser(); // Get current user to check roles
    const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
    const [isEditModalOpen, setEditModalOpen] = React.useState(false);
    const [selectedPlantToEdit, setSelectedPlantToEdit] = React.useState<Plant | null>(null);
    const [plants, setPlants] = React.useState<Plant[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState<boolean>(false);
    const [plantToDeleteId, setPlantToDeleteId] = React.useState<string | null>(null);
    const [deleteError, setDeleteError] = React.useState<string | null>(null);


    // Yetki kontrolü:
    // Fidan kimliği oluşturma yetkisi
    const canCreatePlant = currentUser?.roles?.some(role =>
        role.name === 'Yönetici' || role.name === 'Satış Personeli'
    );
    // Fidan kimliği düzenleme yetkisi (şimdilik sadece Yönetici)
    const canEditPlants = currentUser?.roles?.some(role =>
        role.name === 'Yönetici'
    );
    // Fidan kimliği silme yetkisi (şimdilik sadece Yönetici)
    const canDeletePlants = currentUser?.roles?.some(role =>
        role.name === 'Yönetici'
    );
    // Fidan kimliği listeleme yetkisi olanlar (backend'de hasAnyAuthority var)
    const canListPlants = currentUser?.roles?.some(role =>
        role.name === 'Yönetici' || role.name === 'Satış Personeli' || role.name === 'Depo Sorumlusu'
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
        if (canListPlants) { // Sadece listeleme yetkisi olanlar fetch etsin
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
                    {canCreatePlant && ( // Sadece yetkili olanlar Ekle butonu görebilsin
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

            {canEditPlants && ( // Sadece yetkili olanlar düzenleme formu görebilsin
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
                    onEdit={canEditPlants ? handleEditClick : undefined} // Sadece yetkili olanlar düzenleyebilsin
                    onDelete={canDeletePlants ? handleDeleteClick : undefined} // Sadece yetkili olanlar silebilsin
                />
            )}

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
        </Stack>
    );
}