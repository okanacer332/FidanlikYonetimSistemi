'use client';

import * as React from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  Alert, Autocomplete, Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, IconButton, Stack, TextField, Typography,
} from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';

import type { MasterData, ProductionBatch, ProductionBatchCreateFormValues } from '@/types/nursery';
// Fidan tanımlama mini-modalları
import { PlantTypeCreateForm } from '@/components/dashboard/nursery/plant-type-create-form';
import { PlantVarietyCreateForm } from '@/components/dashboard/nursery/plant-variety-create-form';
import { RootstockCreateForm } from '@/components/dashboard/nursery/rootstock-create-form';
import { PlantSizeCreateForm } from '@/components/dashboard/nursery/plant-size-create-form';
import { PlantAgeCreateForm } from '@/components/dashboard/nursery/plant-age-create-form';
import { LandCreateForm } from '@/components/dashboard/nursery/land-create-form';


const schema = zod.object({
  name: zod.string().min(1, 'Parti adı zorunludur.'),
  birthDate: zod.string().min(1, 'Doğum tarihi zorunludur.'),
  initialPlantQuantity: zod.coerce.number().positive('Başlangıç fidan adedi 0\'dan büyük olmalıdır.'),
  plantTypeId: zod.string().min(1, 'Fidan türü seçimi zorunludur.'),
  plantVarietyId: zod.string().min(1, 'Fidan çeşidi seçimi zorunludur.'),
  rootstockId: zod.string().min(1, 'Anaç seçimi zorunludur.'),
  plantSizeId: zod.string().min(1, 'Fidan boyu seçimi zorunludur.'),
  plantAgeId: zod.string().min(1, 'Fidan yaşı seçimi zorunludur.'),
  landId: zod.string().min(1, 'Arazi seçimi zorunludur.'),
});

type FormValues = zod.infer<typeof schema>;

interface ProductionBatchFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productionBatch: ProductionBatch | null; // Düzenlenecek parti (null ise yeni kayıt)
  masterData: MasterData | null; // Dropdown'ları doldurmak için
}

export function ProductionBatchForm({ open, onClose, onSuccess, productionBatch, masterData }: ProductionBatchFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);

  const [modalToOpen, setModalToOpen] = React.useState<string | null>(null); // Mini-modal kontrolü

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
        name: '',
        birthDate: dayjs().format('YYYY-MM-DD'),
        initialPlantQuantity: 0,
        plantTypeId: '',
        plantVarietyId: '',
        rootstockId: '',
        plantSizeId: '',
        plantAgeId: '',
        landId: '',
    },
  });

  const selectedValues = useWatch({ control }); // Form alanlarının değerlerini izlemek için

  React.useEffect(() => {
    if (open) {
      if (productionBatch) {
        reset({
          name: productionBatch.name,
          birthDate: dayjs(productionBatch.birthDate).format('YYYY-MM-DD'),
          initialPlantQuantity: productionBatch.initialPlantQuantity,
          plantTypeId: productionBatch.plantType?.id || '',
          plantVarietyId: productionBatch.plantVariety?.id || '',
          rootstockId: productionBatch.rootstock?.id || '',
          plantSizeId: productionBatch.plantSize?.id || '',
          plantAgeId: productionBatch.plantAge?.id || '',
          landId: productionBatch.land?.id || '',
        });
      } else {
        reset({
            name: '',
            birthDate: dayjs().format('YYYY-MM-DD'),
            initialPlantQuantity: 0,
            plantTypeId: '',
            plantVarietyId: '',
            rootstockId: '',
            plantSizeId: '',
            plantAgeId: '',
            landId: '',
        });
      }
      setFormError(null);
    }
  }, [open, productionBatch, reset]);

  // Dependent dropdown'lar için resetleme
  React.useEffect(() => { if (open && selectedValues.plantTypeId !== (productionBatch?.plantType?.id || '')) { setValue('plantVarietyId', ''); } }, [selectedValues.plantTypeId, setValue, open, productionBatch]);
  React.useEffect(() => { if (open && selectedValues.plantVarietyId !== (productionBatch?.plantVariety?.id || '')) { setValue('rootstockId', ''); } }, [selectedValues.plantVarietyId, setValue, open, productionBatch]);
  React.useEffect(() => { if (open && selectedValues.rootstockId !== (productionBatch?.rootstock?.id || '')) { setValue('plantSizeId', ''); } }, [selectedValues.rootstockId, setValue, open, productionBatch]);
  React.useEffect(() => { if (open && selectedValues.plantSizeId !== (productionBatch?.plantSize?.id || '')) { setValue('plantAgeId', ''); } }, [selectedValues.plantSizeId, setValue, open, productionBatch]);
  React.useEffect(() => { if (open && selectedValues.plantAgeId !== (productionBatch?.plantAge?.id || '')) { setValue('landId', ''); } }, [selectedValues.plantAgeId, setValue, open, productionBatch]);


  const onSubmit = React.useCallback(async (values: FormValues): Promise<void> => {
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');

      const url = productionBatch
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/production-batches/${productionBatch.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/production-batches`;
      const method = productionBatch ? 'PUT' : 'POST';
      
      const payload = {
        ...values,
        birthDate: dayjs(values.birthDate).toISOString(), // ISO formatına çevir
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'İşlem başarısız.');
      }
      onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    }
  }, [productionBatch, onSuccess]);

  const filteredVarieties = React.useMemo(() => {
    if (!masterData || !selectedValues.plantTypeId) return [];
    return masterData.plantVarieties.filter(v => v.plantTypeId === selectedValues.plantTypeId);
  }, [masterData, selectedValues.plantTypeId]);

  const handleMiniModalSuccess = () => {
    // Mini-modal'dan başarılı dönüldüğünde masterData'yı yenile ve modalı kapat
    // ProductionBatchManagement sayfasındaki fetchData'yı yeniden çağırarak masterData'yı güncelleyebiliriz.
    onSuccess(); // Ana sayfadaki fetchData'yı tetikler
    setModalToOpen(null); // Mini modalı kapat
  };


  const renderAutocompleteWithAdd = (
    name: keyof FormValues,
    label: string,
    options: readonly { id: string; name: string }[] | undefined = [],
    onAddClick: () => void,
    disabled: boolean = false
  ) => (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const { onChange, value, ...rest } = field;
          const selectedOption = options.find(option => option.id === value) || null;

          return (
            <Autocomplete {...rest} fullWidth value={selectedOption}
              onChange={(_, newValue) => { onChange(newValue ? newValue.id : ''); }}
              options={options} getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, val) => option.id === val.id}
              disabled={disabled}
              renderInput={(params) => (<TextField {...params} label={label} error={!!error} helperText={error?.message} size="small"/>)}
            />
          );
        }}
      />
      <IconButton color="primary" onClick={onAddClick} disabled={disabled} sx={{ mt: '1px' }}><PlusIcon /></IconButton>
    </Stack>
  );

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{productionBatch ? 'Üretim Partisini Düzenle' : 'Yeni Üretim Partisi Oluştur'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers sx={{ p: 3 }}>
            {!masterData ? ( // MasterData yüklenmediyse yükleme göstergesi
              <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <CircularProgress />
                <Typography sx={{mt:2}}>Tanımlar yükleniyor...</Typography>
              </Stack>
            ) : (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={2}>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Parti Adı"
                          fullWidth
                          required
                          size="small"
                          error={Boolean(errors.name)}
                          helperText={errors.name?.message}
                        />
                      )}
                    />
                    <Controller
                      name="birthDate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Parti Başlangıç Tarihi"
                          type="date"
                          fullWidth
                          required
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          error={Boolean(errors.birthDate)}
                          helperText={errors.birthDate?.message}
                        />
                      )}
                    />
                    <Controller
                      name="initialPlantQuantity"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Başlangıç Fidan Adedi"
                          type="number"
                          fullWidth
                          required
                          size="small"
                          error={Boolean(errors.initialPlantQuantity)}
                          helperText={errors.initialPlantQuantity?.message}
                        />
                      )}
                    />
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={2}>
                    {renderAutocompleteWithAdd('plantTypeId', 'Fidan Türü', masterData?.plantTypes, () => setModalToOpen('plantType'))}
                    {selectedValues.plantTypeId && (
                      renderAutocompleteWithAdd('plantVarietyId', 'Fidan Çeşidi', filteredVarieties, () => setModalToOpen('plantVariety'))
                    )}
                    {selectedValues.plantVarietyId && (
                      renderAutocompleteWithAdd('rootstockId', 'Anaç', masterData?.rootstocks, () => setModalToOpen('rootstock'))
                    )}
                    {selectedValues.rootstockId && (
                      renderAutocompleteWithAdd('plantSizeId', 'Fidan Boyu', masterData?.plantSizes, () => setModalToOpen('plantSize'))
                    )}
                    {selectedValues.plantSizeId && (
                      renderAutocompleteWithAdd('plantAgeId', 'Fidan Yaşı', masterData?.plantAges, () => setModalToOpen('plantAge'))
                    )}
                     {selectedValues.plantAgeId && (
                      renderAutocompleteWithAdd('landId', 'Arazi', masterData?.lands, () => setModalToOpen('land'))
                    )}
                  </Stack>
                </Grid>
              </Grid>
            )}
            {formError && <Alert severity="error" sx={{ mt: 3 }}>{formError}</Alert>}
          </DialogContent>
          <DialogActions sx={{ p: '16px 24px' }}>
            <Button onClick={onClose} disabled={isSubmitting}>İptal</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting || !masterData}>
              {isSubmitting ? <CircularProgress size={24} /> : (productionBatch ? 'Kaydet' : 'Oluştur')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Mini Modallar */}
      <PlantTypeCreateForm open={modalToOpen === 'plantType'} onClose={() => setModalToOpen(null)} onSuccess={handleMiniModalSuccess} />
      <PlantVarietyCreateForm open={modalToOpen === 'plantVariety'} onClose={() => setModalToOpen(null)} onSuccess={handleMiniModalSuccess} plantTypeId={selectedValues.plantTypeId || ''} />
      <RootstockCreateForm open={modalToOpen === 'rootstock'} onClose={() => setModalToOpen(null)} onSuccess={handleMiniModalSuccess} />
      <PlantSizeCreateForm open={modalToOpen === 'plantSize'} onClose={() => setModalToOpen(null)} onSuccess={handleMiniModalSuccess} />
      <PlantAgeCreateForm open={modalToOpen === 'plantAge'} onClose={() => setModalToOpen(null)} onSuccess={handleMiniModalSuccess} />
      <LandCreateForm open={modalToOpen === 'land'} onClose={() => setModalToOpen(null)} onSuccess={handleMiniModalSuccess} />
    </>
  );
}