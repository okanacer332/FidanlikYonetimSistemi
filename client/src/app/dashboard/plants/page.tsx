'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import {
  Stack, Typography, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Button, Card, CardContent, TextField, InputAdornment
} from '@mui/material';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react';

import type { Plant, MasterData, PlantCreateFormValues } from '@/types/nursery';
import { useUser } from '@/hooks/use-user';
import { PlantsTable } from '@/components/dashboard/nursery/plants-table';
import { PlantCreateInline } from '@/components/dashboard/nursery/plant-create-inline';
import { PlantEditForm } from '@/components/dashboard/nursery/plant-edit-form';

// Diğer importlar...
import { PlantTypeCreateForm } from '@/components/dashboard/nursery/plant-type-create-form';
import { PlantVarietyCreateForm } from '@/components/dashboard/nursery/plant-variety-create-form';
import { RootstockCreateForm } from '@/components/dashboard/nursery/rootstock-create-form';
import { PlantSizeCreateForm } from '@/components/dashboard/nursery/plant-size-create-form';
import { PlantAgeCreateForm } from '@/components/dashboard/nursery/plant-age-create-form';
import { LandCreateForm } from '@/components/dashboard/nursery/land-create-form';


const schema = zod.object({
  plantTypeId: zod.string().min(1, 'Fidan türü seçimi zorunludur.'),
  plantVarietyId: zod.string().min(1, 'Fidan çeşidi seçimi zorunludur.'),
  rootstockId: zod.string().min(1, 'Anaç seçimi zorunludur.'),
  plantSizeId: zod.string().min(1, 'Fidan boyu seçimi zorunludur.'),
  plantAgeId: zod.string().min(1, 'Fidan yaşı seçimi zorunludur.'),
  landId: zod.string().min(1, 'Arazi seçimi zorunludur.'),
});

export default function Page(): React.JSX.Element {
    const { user: currentUser } = useUser();
    const [plants, setPlants] = React.useState<Plant[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [pageError, setPageError] = React.useState<string | null>(null);
    const [masterData, setMasterData] = React.useState<MasterData | null>(null);

    const [isEditModalOpen, setEditModalOpen] = React.useState(false);
    const [selectedPlantToEdit, setSelectedPlantToEdit] = React.useState<Plant | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false);
    const [plantToDeleteId, setPlantToDeleteId] = React.useState<string | null>(null);
    const [deleteError, setDeleteError] = React.useState<string | null>(null);
    const [modalToOpen, setModalToOpen] = React.useState<string | null>(null);
    
    const canCreatePlant = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'SALES');
    const canEditPlants = currentUser?.roles?.some(role => role.name === 'ADMIN');
    const canDeletePlants = currentUser?.roles?.some(role => role.name === 'ADMIN');
    const canListPlants = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'SALES' || role.name === 'WAREHOUSE_STAFF');

    const { control, handleSubmit, reset, watch, setError, formState: { errors, isSubmitting } } = useForm<PlantCreateFormValues>({
        resolver: zodResolver(schema),
        defaultValues: { plantTypeId: '', plantVarietyId: '', rootstockId: '', plantSizeId: '', plantAgeId: '', landId: '' },
    });

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        setPageError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');
            const [plantsRes, masterDataRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/master-data`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            if (!plantsRes.ok) throw new Error(`Fidan kimlikleri yüklenemedi (Hata: ${plantsRes.status})`);
            if (!masterDataRes.ok) throw new Error(`Ana veriler yüklenemedi (Hata: ${masterDataRes.status})`);
            setPlants(await plantsRes.json());
            setMasterData(await masterDataRes.json());
        } catch (err) {
            setPageError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (canListPlants) { fetchData(); }
        else { setLoading(false); setPageError('Bu sayfayı görüntüleme yetkiniz yok.'); }
    }, [canListPlants, fetchData]);

    const onSubmit = React.useCallback(async (values: PlantCreateFormValues) => {
        setPageError(null);
        setError('root', {});
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(values),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Fidan kimliği oluşturulamadı.');
            }
            reset(); 
            await fetchData();
        } catch (err) {
            setError('root', { type: 'server', message: err instanceof Error ? err.message : 'Bir hata oluştu.' });
        }
    }, [fetchData, reset, setError]);
    
    const handleEditClick = React.useCallback((plant: Plant) => { setSelectedPlantToEdit(plant); setEditModalOpen(true); }, []);
    const handleEditSuccess = React.useCallback(() => { setEditModalOpen(false); setSelectedPlantToEdit(null); fetchData(); }, [fetchData]);
    const handleDeleteClick = React.useCallback((plantId: string) => { setPlantToDeleteId(plantId); setIsConfirmDeleteOpen(true); setDeleteError(null); }, []);
    const handleCloseDeleteConfirm = React.useCallback(() => { setIsConfirmDeleteOpen(false); setPlantToDeleteId(null); setDeleteError(null); }, []);

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
            if (!response.ok) { throw new Error((await response.json()).message || 'Fidan silinemedi.'); }
            handleCloseDeleteConfirm();
            await fetchData();
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Silme işlemi sırasında bir hata oluştu.');
        }
    }, [plantToDeleteId, fetchData, handleCloseDeleteConfirm]);

    if (loading) {
        return (
            <Stack sx={{ width: '100%', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <CircularProgress />
                <Typography sx={{mt: 2}}>Veriler yükleniyor...</Typography>
            </Stack>
        );
    }
    
    return (
        // DEĞİŞİKLİK: spacing değeri 3'ten 2'ye düşürüldü.
        <Stack spacing={2}>
            {/* DEĞİŞİKLİK: variant h4'ten h5'e düşürüldü. */}
            <Typography variant="h5">Fidan Yönetimi</Typography>
            
            {pageError && <Alert severity="error">{pageError}</Alert>}

            {canCreatePlant && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <PlantCreateInline control={control} errors={errors} masterData={masterData} isSubmitting={isSubmitting} onAddMasterData={(type) => setModalToOpen(type)}/>
              </form>
            )}
            
            <PlantsTable rows={plants} onEdit={canEditPlants ? handleEditClick : undefined} onDelete={canDeletePlants ? handleDeleteClick : undefined}/>
            
            {/* --- Modallar --- */}
            {canEditPlants && <PlantEditForm open={isEditModalOpen} onClose={() => setEditModalOpen(false)} onSuccess={handleEditSuccess} plant={selectedPlantToEdit} />}
            <Dialog open={isConfirmDeleteOpen} onClose={handleCloseDeleteConfirm}>
                <DialogTitle>Fidan Kimliğini Sil</DialogTitle>
                <DialogContent><DialogContentText>Bu fidan kimliğini kalıcı olarak silmek istediğinizden emin misiniz?</DialogContentText>{deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}</DialogContent>
                <DialogActions><Button onClick={handleCloseDeleteConfirm}>İptal</Button><Button onClick={handleConfirmDelete} color="error">Sil</Button></DialogActions>
            </Dialog>
            <PlantTypeCreateForm open={modalToOpen === 'plantType'} onClose={() => setModalToOpen(null)} onSuccess={fetchData} />
            <PlantVarietyCreateForm open={modalToOpen === 'plantVariety'} onClose={() => setModalToOpen(null)} onSuccess={fetchData} plantTypeId={watch('plantTypeId')} />
            <RootstockCreateForm open={modalToOpen === 'rootstock'} onClose={() => setModalToOpen(null)} onSuccess={fetchData} />
            <PlantSizeCreateForm open={modalToOpen === 'plantSize'} onClose={() => setModalToOpen(null)} onSuccess={fetchData} />
            <PlantAgeCreateForm open={modalToOpen === 'plantAge'} onClose={() => setModalToOpen(null)} onSuccess={fetchData} />
            <LandCreateForm open={modalToOpen === 'land'} onClose={() => setModalToOpen(null)} onSuccess={fetchData} />
        </Stack>
    );
}