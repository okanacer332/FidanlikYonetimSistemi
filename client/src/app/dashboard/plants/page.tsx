// src/app/(dashboard)/plants/page.tsx (Tüm Düzeltmeleri ve Optimizasyonları İçeren Nihai Hali)
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
  Grid,
} from '@mui/material';
import { Pencil as PencilIcon, Trash as TrashIcon } from '@phosphor-icons/react';

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


// --- Form Şeması ---
const schema = zod.object({
  plantTypeId: zod.string().min(1, 'Fidan türü seçimi zorunludur.'),
  plantVarietyId: zod.string().min(1, 'Fidan çeşidi seçimi zorunludur.'),
  rootstockId: zod.string().min(1, 'Anaç seçimi zorunludur.'),
  plantSizeId: zod.string().min(1, 'Fidan boyu seçimi zorunludur.'),
  plantAgeId: zod.string().min(1, 'Fidan yaşı seçimi zorunludur.'),
  landId: zod.string().min(1, 'Arazi seçimi zorunludur.'),
});

// --- Ana Sayfa Bileşeni ---
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

  const { control, handleSubmit, reset, watch, setValue, setError: setFormError, formState: { isSubmitting } } = useForm<PlantCreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { plantTypeId: '', plantVarietyId: '', rootstockId: '', plantSizeId: '', plantAgeId: '', landId: '' },
  });
  const watchedValues = watch();

  // --- OTOMATİK FORM TEMİZLEME MANTIĞI ---
  const isFirstRender = React.useRef(true);
  React.useEffect(() => { if (isFirstRender.current) return; setValue('plantVarietyId', ''); }, [watchedValues.plantTypeId, setValue]);
  React.useEffect(() => { if (isFirstRender.current) return; setValue('rootstockId', ''); }, [watchedValues.plantVarietyId, setValue]);
  React.useEffect(() => { if (isFirstRender.current) return; setValue('plantSizeId', ''); }, [watchedValues.rootstockId, setValue]);
  React.useEffect(() => { if (isFirstRender.current) return; setValue('plantAgeId', ''); }, [watchedValues.plantSizeId, setValue]);
  React.useEffect(() => { if (isFirstRender.current) return; setValue('landId', ''); }, [watchedValues.plantAgeId, setValue]);
  React.useEffect(() => { isFirstRender.current = false; }, []);

  // --- YETKİ KONTROLLERİ ---
  const canList = currentUser?.roles?.some(role => ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'].includes(role.name));
  const canCreate = currentUser?.roles?.some(role => ['ADMIN', 'SALES'].includes(role.name));
  const canEdit = currentUser?.roles?.some(role => role.name === 'ADMIN');
  const canDelete = currentUser?.roles?.some(role => role.name === 'ADMIN');

  // --- VERİ ÇEKME VE AKSİYON FONKSİYONLARI ---
  const fetchData = React.useCallback(async (showSuccessToast: boolean = false) => {
    if (!modalToOpen) setIsLoading(true);
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
      if (showSuccessToast) notify.success('Ana veriler güncellendi.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    } finally {
      setIsLoading(false);
      if (modalToOpen) setModalToOpen(null);
    }
  }, [modalToOpen, notify]);

  React.useEffect(() => {
    if (canList) { 
      fetchData(); 
    } else { 
      setIsLoading(false); 
      setError('Bu sayfayı görüntüleme yetkiniz yok.'); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canList]);

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
      reset();
      setCreateFormOpen(false);
      await fetchData();
      notify.success('Fidan başarıyla oluşturuldu.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu.';
      notify.error(errorMessage);
      setFormError('root', { type: 'server', message: errorMessage });
    }
  }, [fetchData, reset, setFormError, notify]);

  const handleEditSuccess = React.useCallback(() => {
    setEditModalOpen(false);
    fetchData();
    notify.success('Fidan başarıyla güncellendi.');
  }, [fetchData, notify]);

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!plantToDelete) return;
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı.');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants/${plantToDelete.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) { throw new Error((await response.json()).message || 'Fidan silinemedi.'); }
      setPlantToDelete(null);
      await fetchData();
      notify.success('Fidan başarıyla silindi.');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Silme işlemi başarısız oldu.');
    }
  }, [plantToDelete, fetchData, notify]);
  
  // --- FİLTRELEME VE TABLO YÖNETİMİ ---
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
          {canEdit && <Tooltip title="Düzenle"><IconButton size="small" onClick={() => { setPlantToEdit(row); setEditModalOpen(true); }}><PencilIcon /></IconButton></Tooltip>}
          {canDelete && <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => setPlantToDelete(row)}><TrashIcon /></IconButton></Tooltip>}
        </Stack>
      ),
    },
  ], [canEdit, canDelete]);

  // --- ANA RENDER ---
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
        <form onSubmit={handleSubmit(handleCreateSubmit)}>
          <Grid container spacing={2} sx={{ p: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ControlledAutocomplete control={control} name="plantTypeId" label="Fidan Türü" options={data.masterData?.plantTypes || []} size="small" onAddClick={() => setModalToOpen('plantType')} />
            </Grid>
            {watchedValues.plantTypeId && (
              <Grid size={{ xs: 12, md: 6 }}>
                <ControlledAutocomplete control={control} name="plantVarietyId" label="Fidan Çeşidi" options={data.masterData?.plantVarieties.filter(v => v.plantTypeId === watchedValues.plantTypeId) || []} size="small" onAddClick={() => setModalToOpen('plantVariety')} />
              </Grid>
            )}
            {watchedValues.plantVarietyId && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ControlledAutocomplete control={control} name="rootstockId" label="Anaç" options={data.masterData?.rootstocks || []} size="small" onAddClick={() => setModalToOpen('rootstock')} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ControlledAutocomplete control={control} name="plantSizeId" label="Fidan Boyu" options={data.masterData?.plantSizes || []} size="small" onAddClick={() => setModalToOpen('plantSize')} />
                </Grid>
              </>
            )}
            {watchedValues.plantSizeId && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ControlledAutocomplete control={control} name="plantAgeId" label="Fidan Yaşı" options={data.masterData?.plantAges || []} size="small" onAddClick={() => setModalToOpen('plantAge')} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ControlledAutocomplete control={control} name="landId" label="Arazi" options={data.masterData?.lands || []} size="small" onAddClick={() => setModalToOpen('land')} />
                </Grid>
              </>
            )}
            {watchedValues.landId && (
              <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" disabled={isSubmitting}>Kaydet</Button>
              </Grid>
            )}
          </Grid>
        </form>
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
      />
      
      {/* --- Modallar --- */}
      {canEdit && <PlantEditForm open={isEditModalOpen} onClose={() => setEditModalOpen(false)} onSuccess={handleEditSuccess} plant={plantToEdit} />}
      <Dialog open={!!plantToDelete} onClose={() => setPlantToDelete(null)}>
        <DialogTitle>Fidan Kimliğini Sil</DialogTitle>
        <DialogContent><DialogContentText>Bu fidanı kalıcı olarak silmek istediğinizden emin misiniz?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setPlantToDelete(null)}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error">Sil</Button>
        </DialogActions>
      </Dialog>
      <PlantTypeCreateForm open={modalToOpen === 'plantType'} onClose={() => setModalToOpen(null)} onSuccess={() => fetchData(true)} />
      <PlantVarietyCreateForm open={modalToOpen === 'plantVariety'} onClose={() => setModalToOpen(null)} onSuccess={() => fetchData(true)} plantTypeId={watchedValues.plantTypeId || ''} />
      <RootstockCreateForm open={modalToOpen === 'rootstock'} onClose={() => setModalToOpen(null)} onSuccess={() => fetchData(true)} />
      <PlantSizeCreateForm open={modalToOpen === 'plantSize'} onClose={() => setModalToOpen(null)} onSuccess={() => fetchData(true)} />
      <PlantAgeCreateForm open={modalToOpen === 'plantAge'} onClose={() => setModalToOpen(null)} onSuccess={() => fetchData(true)} />
      <LandCreateForm open={modalToOpen === 'land'} onClose={() => setModalToOpen(null)} onSuccess={() => fetchData(true)} />
    </Stack>
  );
}
