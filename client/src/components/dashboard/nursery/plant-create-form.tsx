// client/src/components/dashboard/nursery/plant-create-form.tsx
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z as zod } from 'zod';

import type { MasterData, PlantCreateFormValues } from '@/types/nursery';
import { PlantTypeCreateForm } from './plant-type-create-form'; // .tsx uzantısı kaldırıldı
import { PlantVarietyCreateForm } from './plant-variety-create-form'; // .tsx uzantısı kaldırıldı
import { RootstockCreateForm } from './rootstock-create-form'; // .tsx uzantısı kaldırıldı
import { PlantSizeCreateForm } from './plant-size-create-form'; // .tsx uzantısı kaldırıldı
import { PlantAgeCreateForm } from './plant-age-create-form'; // .tsx uzantısı kaldırıldı
import { LandCreateForm } from './land-create-form'; // .tsx uzantısı kaldırıldı

const schema = zod.object({
  plantTypeId: zod.string().min(1, 'Fidan türü seçimi zorunludur.'),
  plantVarietyId: zod.string().min(1, 'Fidan çeşidi seçimi zorunludur.'),
  rootstockId: zod.string().min(1, 'Anaç seçimi zorunludur.'),
  plantSizeId: zod.string().min(1, 'Fidan boyu seçimi zorunludur.'),
  plantAgeId: zod.string().min(1, 'Fidan yaşı seçimi zorunludur.'),
  landId: zod.string().min(1, 'Arazi seçimi zorunludur.'),
  // Fiyat alanları kaldırıldı.
});

interface PlantCreateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PlantCreateForm({ open, onClose, onSuccess }: PlantCreateFormProps): React.JSX.Element {
  const [masterData, setMasterData] = React.useState<MasterData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [isPlantTypeModalOpen, setPlantTypeModalOpen] = React.useState(false);
  const [isPlantVarietyModalOpen, setPlantVarietyModalOpen] = React.useState(false);
  const [isRootstockModalOpen, setRootstockModalOpen] = React.useState(false);
  const [isPlantSizeModalOpen, setPlantSizeModalOpen] = React.useState(false);
  const [isPlantAgeModalOpen, setPlantAgeModalOpen] = React.useState(false);
  const [isLandModalOpen, setLandModalOpen] = React.useState(false);

  const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<PlantCreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { plantTypeId: '', plantVarietyId: '', rootstockId: '', plantSizeId: '', plantAgeId: '', landId: '' },
  });

  const selectedValues = useWatch({ control });

  const fetchMasterData = React.useCallback(async () => {
    setIsLoading(true);
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum tokenı bulunamadı.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/master-data`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Ana veriler yüklenemedi.');

      const data = await response.json();
      setMasterData(data);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      fetchMasterData();
    } else {
      reset();
    }
  }, [open, fetchMasterData, reset]);

  // Dependent dropdown'lar için resetleme
  React.useEffect(() => { if (open) setValue('plantVarietyId', ''); }, [selectedValues.plantTypeId, setValue, open]);
  React.useEffect(() => { if (open) setValue('rootstockId', ''); }, [selectedValues.plantVarietyId, setValue, open]);
  React.useEffect(() => { if (open) setValue('plantSizeId', ''); }, [selectedValues.rootstockId, setValue, open]);
  React.useEffect(() => { if (open) setValue('plantAgeId', ''); }, [selectedValues.plantSizeId, setValue, open]);
  React.useEffect(() => { if (open) setValue('landId', ''); }, [selectedValues.plantAgeId, setValue, open]);


  const onSubmit = async (values: PlantCreateFormValues) => {
    setFormError(null);
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(values),
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Fidan kimliği oluşturulamadı.');
        }
        onSuccess();
    } catch(err) {
        setFormError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    }
  };

  const filteredVarieties = React.useMemo(() => {
    if (!masterData || !selectedValues.plantTypeId) return [];
    return masterData.plantVarieties.filter(v => v.plantTypeId === selectedValues.plantTypeId);
  }, [masterData, selectedValues.plantTypeId]);

  const handleMiniModalSuccess = () => {
    fetchMasterData(); // Yeni verileri çek
    setPlantTypeModalOpen(false);
    setPlantVarietyModalOpen(false);
    setRootstockModalOpen(false);
    setPlantSizeModalOpen(false);
    setPlantAgeModalOpen(false);
    setLandModalOpen(false); // Yeni: Land modalını kapat
  };

  const renderAutocompleteWithAdd = (
    name: keyof PlantCreateFormValues,
    label: string,
    options: readonly { id: string; name: string }[] | undefined = [],
    onAddClick: () => void,
    disabled: boolean = false
  ) => (
    <Stack direction="row" spacing={1} alignItems="center">
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const { onChange, value } = field;
          const selectedOption = options.find(option => option.id === value) || null;

          return (
            <Autocomplete
              fullWidth
              value={selectedOption}
              onChange={(event, newValue) => {
                onChange(newValue ? newValue.id : '');
              }}
              options={options}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, val) => option.id === val.id}
              disabled={disabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={label}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          );
        }}
      />
      <IconButton color="primary" onClick={onAddClick} disabled={disabled}>
        <PlusIcon />
      </IconButton>
    </Stack>
  );

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Fidan Kimliği Oluştur</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers sx={{ p: 3 }}>
            {isLoading ? (
              <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <CircularProgress />
              </Stack>
            ) : formError ? (
              <Alert severity="error">{formError}</Alert>
            ) : (
              <Stack spacing={3}>
                {renderAutocompleteWithAdd('plantTypeId', 'Fidan Türü', masterData?.plantTypes, () => setPlantTypeModalOpen(true))}

                {selectedValues.plantTypeId && (
                  renderAutocompleteWithAdd('plantVarietyId', 'Fidan Çeşidi', filteredVarieties, () => setPlantVarietyModalOpen(true))
                )}

                {selectedValues.plantVarietyId && (
                  renderAutocompleteWithAdd('rootstockId', 'Anaç', masterData?.rootstocks, () => setRootstockModalOpen(true))
                )}

                {selectedValues.rootstockId && (
                  renderAutocompleteWithAdd('plantSizeId', 'Fidan Boyu', masterData?.plantSizes, () => setPlantSizeModalOpen(true))
                )}

                {selectedValues.plantSizeId && (
                  renderAutocompleteWithAdd('plantAgeId', 'Fidan Yaşı', masterData?.plantAges, () => setPlantAgeModalOpen(true))
                )}

                {selectedValues.plantAgeId && (
                  renderAutocompleteWithAdd('landId', 'Arazi', masterData?.lands, () => setLandModalOpen(true))
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: '16px 24px' }}>
            <Button onClick={onClose}>İptal</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting || isLoading}>Kaydet</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* İkincil Modal'lar */}
      <PlantTypeCreateForm open={isPlantTypeModalOpen} onClose={() => setPlantTypeModalOpen(false)} onSuccess={handleMiniModalSuccess} />
      <RootstockCreateForm open={isRootstockModalOpen} onClose={() => setRootstockModalOpen(false)} onSuccess={handleMiniModalSuccess} />
      <PlantSizeCreateForm open={isPlantSizeModalOpen} onClose={() => setPlantSizeModalOpen(false)} onSuccess={handleMiniModalSuccess} />
      <PlantAgeCreateForm open={isPlantAgeModalOpen} onClose={() => setPlantAgeModalOpen(false)} onSuccess={handleMiniModalSuccess} />
      <PlantVarietyCreateForm open={isPlantVarietyModalOpen} onClose={() => setPlantVarietyModalOpen(false)} onSuccess={handleMiniModalSuccess} plantTypeId={selectedValues.plantTypeId || ''} /> {/* BURAYI DA GÜNCELLEDİK! */}
      <LandCreateForm open={isLandModalOpen} onClose={() => setLandModalOpen(false)} onSuccess={handleMiniModalSuccess} />
    </>
  );
}