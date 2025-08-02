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

// Ortak Bileşenler ve Hook'lar
import { PageHeader } from '@/components/common/PageHeader';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { InlineCreateForm } from '@/components/common/InlineCreateForm';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { ControlledAutocomplete } from '@/components/common/ControlledAutocomplete';
import { useNotifier } from '@/hooks/useNotifier';
import { useUser } from '@/hooks/use-user';
import { useApiSWR } from '@/hooks/use-api-swr'; // YENİ: Modern veri çekme hook'umuz

// Tipler ve Diğer Bileşenler
import type { Plant, MasterData, PlantCreateFormValues } from '@/types/nursery';
import { PlantEditForm } from '@/components/dashboard/nursery/plant-edit-form';
import { PlantTypeCreateForm } from '@/components/dashboard/nursery/plant-type-create-form';
import { PlantVarietyCreateForm } from '@/components/dashboard/nursery/plant-variety-create-form';
import { RootstockCreateForm } from '@/components/dashboard/nursery/rootstock-create-form';
import { PlantSizeCreateForm } from '@/components/dashboard/nursery/plant-size-create-form';
import { PlantAgeCreateForm } from '@/components/dashboard/nursery/plant-age-create-form';
import { LandCreateForm } from '@/components/dashboard/nursery/land-create-form';

const schema = zod.object({
  plantTypeId: zod.string().min(1, 'Fidan türü seçimi zorunlur.'),
  plantVarietyId: zod.string().min(1, 'Fidan çeşidi seçimi zorunlur.'),
  rootstockId: zod.string().min(1, 'Anaç seçimi zorunlur.'),
  plantSizeId: zod.string().min(1, 'Fidan boyu seçimi zorunlur.'),
  plantAgeId: zod.string().min(1, 'Fidan yaşı seçimi zorunlur.'),
  landId: zod.string().min(1, 'Arazi seçimi zorunlur.'),
});

export default function Page(): React.JSX.Element {
  const notify = useNotifier();
  const { user: currentUser } = useUser();
  
  // --- VERİ ÇEKME İŞLEMİ ARTIK BU KADAR BASİT ---
  const { data: plantsData, error: plantsError, isLoading: isLoadingPlants, mutate: mutatePlants } = useApiSWR<Plant[]>('/plants');
  const { data: masterData, error: masterDataError, isLoading: isLoadingMasterData, mutate: mutateMasterData } = useApiSWR<MasterData>('/master-data');
  const isLoading = isLoadingPlants || isLoadingMasterData;
  const error = plantsError || masterDataError;

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
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = React.useState<string>('plantType.name');

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

  const handleRequestSort = React.useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

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
      await mutatePlants(); // SWR'a veriyi yenilemesini söylüyoruz
      notify.success('Fidan başarıyla oluşturuldu.');
      setTimeout(() => setNewlyAddedPlantId(null), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu.';
      notify.error(errorMessage);
      setFormError('root', { type: 'server', message: errorMessage });
    }
  }, [mutatePlants, reset, setFormError, notify]);

  const handleEditClick = React.useCallback((plant: Plant) => {
    setPlantToEdit(plant);
    setEditModalOpen(true);
  }, []);

  const handleEditSuccess = React.useCallback(async () => {
    setEditModalOpen(false);
    await mutatePlants();
    notify.success('Fidan başarıyla güncellendi.');
  }, [mutatePlants, notify]);

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!plantToDelete) return;
    setIsTableLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı.');
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants/${plantToDelete.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
      });
      setPlantToDelete(null);
      await mutatePlants();
      notify.success('Fidan başarıyla silindi.');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Silme işlemi başarısız oldu.');
    } finally {
      setIsTableLoading(false);
    }
  }, [plantToDelete, mutatePlants, notify]);
  
  const handleMiniModalSuccess = React.useCallback(async (newData: { id: string }, type: keyof PlantCreateFormValues) => {
    setModalToOpen(null);
    await mutateMasterData();
    setValue(type, newData.id);
    notify.success('Yeni kayıt eklendi ve seçildi!');
  }, [mutateMasterData, setValue, notify]);

  const sortedAndFilteredPlants = React.useMemo(() => {
    const plants = plantsData || [];
    const filtered = searchTerm
      ? plants.filter((plant) =>
          (plant.plantType?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (plant.plantVariety?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (plant.rootstock?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (plant.land?.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : plants;

    const getSortableValue = (plant: Plant, key: string) => {
      const keys = key.split('.');
      let value: any = plant;
      for (const k of keys) {
        value = value?.[k];
      }
      return value || '';
    };
    
    return [...filtered].sort((a, b) => {
      const aValue = getSortableValue(a, orderBy);
      const bValue = getSortableValue(b, orderBy);
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return bValue > aValue ? 1 : -1;
    });
  }, [plantsData, searchTerm, order, orderBy]);

  const paginatedPlants = React.useMemo(() => {
    return sortedAndFilteredPlants.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedAndFilteredPlants, page, rowsPerPage]);

  const columns: ColumnDef<Plant>[] = React.useMemo(() => [
    { key: 'plantType.name', header: 'Fidan Türü', sortable: true, render: (row) => row.plantType?.name || 'N/A', getValue: (row) => row.plantType?.name || '' },
    { key: 'plantVariety.name', header: 'Fidan Çeşidi', sortable: true, render: (row) => row.plantVariety?.name || 'N/A', getValue: (row) => row.plantVariety?.name || '' },
    { key: 'rootstock.name', header: 'Anaç', sortable: true, render: (row) => row.rootstock?.name || 'N/A', getValue: (row) => row.rootstock?.name || '' },
    { key: 'plantSize.name', header: 'Boy', sortable: true, render: (row) => row.plantSize?.name || 'N/A', getValue: (row) => row.plantSize?.name || '' },
    { key: 'plantAge.name', header: 'Yaş', sortable: true, render: (row) => row.plantAge?.name || 'N/A', getValue: (row) => row.plantAge?.name || '' },
    { key: 'land.name', header: 'Arazi', sortable: true, render: (row) => row.land?.name || 'N/A', getValue: (row) => row.land?.name || '' },
    {
      key: 'actions',
      header: 'İşlemler',
      sortable: false,
      render: (row) => (
        <Stack direction="row">
          {canEdit && <Tooltip title="Düzenle"><IconButton size="small" onClick={() => handleEditClick(row)}><PencilIcon /></IconButton></Tooltip>}
          {canDelete && <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => setPlantToDelete(row)}><TrashIcon /></IconButton></Tooltip>}
        </Stack>
      ),
    },
  ], [canEdit, canDelete, handleEditClick]);
  
  const renderStepperForm = () => {
    const steps = [
        { name: 'plantTypeId', label: 'Fidan Türü', options: masterData?.plantTypes, onAdd: () => setModalToOpen('plantType') },
        { name: 'plantVarietyId', label: 'Fidan Çeşidi', options: masterData?.plantVarieties.filter(v => v.plantTypeId === watchedValues.plantTypeId), onAdd: () => setModalToOpen('plantVariety') },
        { name: 'rootstockId', label: 'Anaç', options: masterData?.rootstocks, onAdd: () => setModalToOpen('rootstock') },
        { name: 'plantSizeId', label: 'Fidan Boyu', options: masterData?.plantSizes, onAdd: () => setModalToOpen('plantSize') },
        { name: 'plantAgeId', label: 'Fidan Yaşı', options: masterData?.plantAges, onAdd: () => setModalToOpen('plantAge') },
        { name: 'landId', label: 'Arazi', options: masterData?.lands, onAdd: () => setModalToOpen('land') },
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
                            <Box key={step.name} sx={{ width: '100%', maxWidth: '320px' }}>
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
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!canList) return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;

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
        data={plantsData || []}
        count={sortedAndFilteredPlants.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); }}
        searchTerm={searchTerm}
        onSearch={(e) => { setSearchTerm(e.target.value); setPage(0); }}
        selectionEnabled={false}
        isLoading={isTableLoading}
        highlightedId={newlyAddedPlantId}
        order={order}
        orderBy={orderBy}
        onSort={handleRequestSort}
      />
      
      <Dialog open={!!plantToDelete} onClose={() => setPlantToDelete(null)}>
        <DialogTitle>Fidan Kimliğini Sil</DialogTitle>
        <DialogContent><DialogContentText>Bu fidanı kalıcı olarak silmek istediğinizden emin misiniz?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setPlantToDelete(null)}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error">Sil</Button>
        </DialogActions>
      </Dialog>
      
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