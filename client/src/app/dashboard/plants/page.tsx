'use client';

import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import {
  Stack,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import { Pencil as PencilIcon, Trash as TrashIcon, ArrowRight as ArrowRightIcon } from '@phosphor-icons/react';

// Ortak Bileşenler
import { PageHeader } from '@/components/common/PageHeader';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { InlineCreateForm } from '@/components/common/InlineCreateForm';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { ControlledAutocomplete } from '@/components/common/ControlledAutocomplete';
import { useNotifier } from '@/hooks/useNotifier';

// Diğer Gerekli Importlar
import type { Plant, MasterData, PlantCreateFormValues } from '@/types/nursery';
import { useUser } from '@/hooks/use-user';
import { PlantEditForm } from '@/components/dashboard/nursery/plant-edit-form';
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
  const notify = useNotifier();
  const { user: currentUser } = useUser();
  const [data, setData] = React.useState<{ plants: Plant[]; masterData: MasterData | null }>({ plants: [], masterData: null });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isCreateFormOpen, setCreateFormOpen] = React.useState(false);
  const [modalToOpen, setModalToOpen] = React.useState<string | null>(null);
  const [isEditModalOpen, setEditModalOpen] = React.useState(false);
  const [plantToEdit, setPlantToEdit] = React.useState<Plant | null>(null);
  const [plantToDelete, setPlantToDelete] = React.useState<Plant | null>(null);
  const [isTableLoading, setIsTableLoading] = React.useState(false);
  const [newlyAddedPlantId, setNewlyAddedPlantId] = React.useState<string | null>(null);

  const { control, handleSubmit, reset, watch, setValue, setError: setFormError, formState: { isSubmitting } } = useForm<PlantCreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { plantTypeId: '', plantVarietyId: '', rootstockId: '', plantSizeId: '', plantAgeId: '', landId: '' },
  });
  const watchedValues = watch();

  const isFirstRender = React.useRef(true);
  React.useEffect(() => { if (isFirstRender.current) return; setValue('plantVarietyId', ''); }, [watchedValues.plantTypeId, setValue]);
  React.useEffect(() => { if (isFirstRender.current) return; setValue('rootstockId', ''); }, [watchedValues.plantVarietyId, setValue]);
  React.useEffect(() => { if (isFirstRender.current) return; setValue('plantSizeId', ''); }, [watchedValues.rootstockId, setValue]);
  React.useEffect(() => { if (isFirstRender.current) return; setValue('plantAgeId', ''); }, [watchedValues.plantSizeId, setValue]);
  React.useEffect(() => { if (isFirstRender.current) return; setValue('landId', ''); }, [watchedValues.plantAgeId, setValue]);
  React.useEffect(() => { isFirstRender.current = false; }, []);

  const canList = currentUser?.roles?.some(role => ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'].includes(role.name));
  const canCreate = currentUser?.roles?.some(role => ['ADMIN', 'SALES'].includes(role.name));
  const canEdit = currentUser?.roles?.some(role => role.name === 'ADMIN');
  const canDelete = currentUser?.roles?.some(role => role.name === 'ADMIN');

  const fetchData = React.useCallback(async (isUpdate = false) => {
    if (isUpdate) {
      setIsTableLoading(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı.');
      const [plantsRes, masterDataRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/master-data`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!plantsRes.ok) throw new Error(`Fidanlar yüklenemedi (Hata: ${plantsRes.status})`);
      if (!masterDataRes.ok) throw new Error(`Ana veriler yüklenemedi (Hata: ${masterDataRes.status})`);
      setData({ plants: await plantsRes.json(), masterData: await masterDataRes.json() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setIsTableLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (canList) { 
      fetchData(false); 
    } else { 
      setIsLoading(false); 
      setError('Bu sayfayı görüntüleme yetkiniz yok.'); 
    }
  }, [canList, fetchData]);

  const handleCreateSubmit = React.useCallback(async (values: PlantCreateFormValues) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı.');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(values),
      });
      if (!response.ok) { throw new Error((await response.json()).message || 'Fidan kimliği oluşturulamadı.'); }
      const newPlant = await response.json();
      reset();
      setCreateFormOpen(false);
      setNewlyAddedPlantId(newPlant.id);
      await fetchData(true);
      notify.success('Fidan başarıyla oluşturuldu.');
      setTimeout(() => setNewlyAddedPlantId(null), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu.';
      notify.error(errorMessage);
      setFormError('root', { type: 'server', message: errorMessage });
    }
  }, [fetchData, reset, setFormError, notify]);

  // --- DÜZENLEME İŞLEMİ İÇİN YENİ HANDLER FONKSİYONU ---
  const handleEditClick = React.useCallback((plant: Plant) => {
    setPlantToEdit(plant);
    setEditModalOpen(true);
  }, []);

  const handleEditSuccess = React.useCallback(() => {
    setEditModalOpen(false);
    fetchData(true);
    notify.success('Fidan başarıyla güncellendi.');
  }, [fetchData, notify]);

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!plantToDelete) return;
    setIsTableLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı.');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants/${plantToDelete.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) { throw new Error((await response.json()).message || 'Fidan silinemedi.'); }
      setPlantToDelete(null);
      await fetchData(true);
      notify.success('Fidan başarıyla silindi.');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Silme işlemi başarısız oldu.');
    } finally {
      setIsTableLoading(false);
    }
  }, [plantToDelete, fetchData, notify]);
  
  const handleMiniModalSuccess = React.useCallback(async (newData: { id: string }, type: keyof PlantCreateFormValues) => {
    setModalToOpen(null);
    await fetchData(true);
    setValue(type, newData.id);
    notify.success('Yeni kayıt eklendi ve seçildi!');
  }, [fetchData, setValue, notify]);

  const filteredPlants = React.useMemo(() => {
    if (!searchTerm) return data.plants;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return data.plants.filter((plant) => (
        plant.plantType?.name.toLowerCase().includes(lowercasedSearchTerm) ||
        plant.plantVariety?.name.toLowerCase().includes(lowercasedSearchTerm) ||
        plant.rootstock?.name.toLowerCase().includes(lowercasedSearchTerm) ||
        plant.land?.name.toLowerCase().includes(lowercasedSearchTerm)
    ));
  }, [data.plants, searchTerm]);

  const paginatedPlants = React.useMemo(() => {
    return filteredPlants.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredPlants, page, rowsPerPage]);

  const columns: ColumnDef<Plant>[] = React.useMemo(() => [
    { key: 'plantType', header: 'Fidan Türü', render: (row) => row.plantType?.name || 'N/A', getValue: (row) => row.plantType?.name || '' },
    { key: 'plantVariety', header: 'Fidan Çeşidi', render: (row) => row.plantVariety?.name || 'N/A', getValue: (row) => row.plantVariety?.name || '' },
    { key: 'rootstock', header: 'Anaç', render: (row) => row.rootstock?.name || 'N/A', getValue: (row) => row.rootstock?.name || '' },
    { key: 'plantSize', header: 'Boy', render: (row) => <Chip label={row.plantSize?.name || 'N/A'} size="small" variant='outlined' />, getValue: (row) => row.plantSize?.name || '' },
    { key: 'plantAge', header: 'Yaş', render: (row) => <Chip label={row.plantAge?.name || 'N/A'} size="small" variant='outlined' />, getValue: (row) => row.plantAge?.name || '' },
    { key: 'land', header: 'Arazi', render: (row) => row.land?.name || 'N/A', getValue: (row) => row.land?.name || '' },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (row) => (
        <Stack direction="row">
          {/* DÜZENLEME: OnClick olayı yeni handler fonksiyonunu çağırıyor */}
          {canEdit && <Tooltip title="Düzenle"><IconButton size="small" onClick={() => handleEditClick(row)}><PencilIcon /></IconButton></Tooltip>}
          {canDelete && <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => setPlantToDelete(row)}><TrashIcon /></IconButton></Tooltip>}
        </Stack>
      ),
    },
  ], [canEdit, canDelete, handleEditClick]); // useMemo bağımlılığına handleEditClick eklendi
  
  const renderStepperForm = () => {
    const steps = [
        { name: 'plantTypeId', label: 'Fidan Türü', options: data.masterData?.plantTypes, onAdd: () => setModalToOpen('plantType') },
        { name: 'plantVarietyId', label: 'Fidan Çeşidi', options: data.masterData?.plantVarieties.filter(v => v.plantTypeId === watchedValues.plantTypeId), onAdd: () => setModalToOpen('plantVariety') },
        { name: 'rootstockId', label: 'Anaç', options: data.masterData?.rootstocks, onAdd: () => setModalToOpen('rootstock') },
        { name: 'plantSizeId', label: 'Fidan Boyu', options: data.masterData?.plantSizes, onAdd: () => setModalToOpen('plantSize') },
        { name: 'plantAgeId', label: 'Fidan Yaşı', options: data.masterData?.plantAges, onAdd: () => setModalToOpen('plantAge') },
        { name: 'landId', label: 'Arazi', options: data.masterData?.lands, onAdd: () => setModalToOpen('land') },
    ];

    let currentStepIndex = 0;
    for (const step of steps) {
        if (!watchedValues[step.name as keyof PlantCreateFormValues]) {
            break;
        }
        currentStepIndex++;
    }

    return (
        <form onSubmit={handleSubmit(handleCreateSubmit)}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{p: 2}}>
                {steps.map((step, index) => {
                    const selectedValue = watchedValues[step.name as keyof PlantCreateFormValues];
                    if (index < currentStepIndex) {
                        const selectedOption = step.options?.find(opt => opt.id === selectedValue);
                        return (
                            <React.Fragment key={step.name}>
                                <Chip 
                                    label={`${step.label}: ${selectedOption?.name || '...'}`} 
                                    onDelete={() => {
                                        for (let i = index; i < steps.length; i++) {
                                            setValue(steps[i].name as keyof PlantCreateFormValues, '');
                                        }
                                    }}
                                />
                                {index < steps.length -1 && <ArrowRightIcon size={20} color="var(--mui-palette-text-secondary)" />}
                            </React.Fragment>
                        );
                    }
                    if (index === currentStepIndex) {
                        return (
                            <Box key={step.name} sx={{minWidth: '250px', flexGrow: 1}}>
                                <ControlledAutocomplete
                                    control={control}
                                    name={step.name as keyof PlantCreateFormValues}
                                    label={step.label}
                                    options={step.options || []}
                                    size="small"
                                    onAddClick={step.onAdd}
                                />
                            </Box>
                        );
                    }
                    return null;
                })}
                 {currentStepIndex === steps.length && (
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : 'Fidan Kimliğini Kaydet'}
                    </Button>
                )}
            </Stack>
        </form>
    );
  };

  if (isLoading) return <Stack alignItems="center" justifyContent="center" sx={{minHeight: '80vh'}}><CircularProgress /></Stack>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Stack spacing={3}>
      <AppBreadcrumbs />
      <PageHeader
        title="Fidan Yönetimi"
        action={ canCreate ? <Button variant="contained" onClick={() => setCreateFormOpen(prev => !prev)}>Yeni Fidan Ekle</Button> : null }
      />
      <InlineCreateForm
        title="Yeni Fidan Kimliği Oluştur"
        isOpen={isCreateFormOpen}
        onClose={() => setCreateFormOpen(false)}
      >
        {renderStepperForm()}
      </InlineCreateForm>
      
      <ActionableTable
        columns={columns}
        rows={paginatedPlants}
        data={data.plants}
        count={filteredPlants.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); }}
        searchTerm={searchTerm}
        onSearch={(e) => { setSearchTerm(e.target.value); setPage(0); }}
        selectionEnabled={false}
        isLoading={isTableLoading}
        highlightedId={newlyAddedPlantId}
      />
      
      <Dialog open={!!plantToDelete} onClose={() => setPlantToDelete(null)}>
        <DialogTitle>Fidan Kimliğini Sil</DialogTitle>
        <DialogContent><DialogContentText>Bu fidanı kalıcı olarak silmek istediğinizden emin misiniz?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setPlantToDelete(null)}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error">Sil</Button>
        </DialogActions>
      </Dialog>
      
      {/* Düzenleme modalı artık `plantToEdit` state'i doluyken render ediliyor */}
      <PlantEditForm 
        open={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        onSuccess={handleEditSuccess} 
        plant={plantToEdit} 
      />

      <PlantTypeCreateForm open={modalToOpen === 'plantType'} onClose={() => setModalToOpen(null)} onSuccess={(data) => handleMiniModalSuccess(data, 'plantTypeId')} />
      <PlantVarietyCreateForm open={modalToOpen === 'plantVariety'} onClose={() => setModalToOpen(null)} onSuccess={(data) => handleMiniModalSuccess(data, 'plantVarietyId')} plantTypeId={watchedValues.plantTypeId || ''} />
      <RootstockCreateForm open={modalToOpen === 'rootstock'} onClose={() => setModalToOpen(null)} onSuccess={(data) => handleMiniModalSuccess(data, 'rootstockId')} />
      <PlantSizeCreateForm open={modalToOpen === 'plantSize'} onClose={() => setModalToOpen(null)} onSuccess={(data) => handleMiniModalSuccess(data, 'plantSizeId')} />
      <PlantAgeCreateForm open={modalToOpen === 'plantAge'} onClose={() => setModalToOpen(null)} onSuccess={(data) => handleMiniModalSuccess(data, 'plantAgeId')} />
      <LandCreateForm open={modalToOpen === 'land'} onClose={() => setModalToOpen(null)} onSuccess={(data) => handleMiniModalSuccess(data, 'landId')} />
    </Stack>
  );
}