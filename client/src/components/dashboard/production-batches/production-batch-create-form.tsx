'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import type { z } from 'zod';
import { z as zod } from 'zod';
import { toast } from 'react-hot-toast';

import {
  Button,
  FormControl,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Typography from '@mui/material/Typography';

import { useApi } from '@/hooks/use-api';
import type { PlantType, PlantVariety } from '@/types/plant';
import { createProductionBatch } from '@/api/nursery'; // createProductionBatch'i import edin

// Form şeması
const schema = zod.object({
  batchCode: zod.string().min(1, 'Parti Kodu zorunludur.').max(50, 'Parti Kodu en fazla 50 karakter olmalıdır.'),
  batchName: zod.string().min(1, 'Parti Adı zorunludur.').max(100, 'Parti Adı en fazla 100 karakter olmalıdır.'),
  startDate: zod.date({ required_error: 'Başlangıç Tarihi zorunludur.' }),
  initialQuantity: zod.number().min(1, 'Başlangıç Adedi en az 1 olmalıdır.').int('Başlangıç Adedi tam sayı olmalıdır.'),
  expectedHarvestQuantity: zod.number().min(0, 'Beklenen Hasat Adedi negatif olamaz.').int('Beklenen Hasat Adedi tam sayı olmalıdır.').optional().nullable(),
  description: zod.string().max(500, 'Açıklama en fazla 500 karakter olmalıdır.').optional().nullable(),
  plantTypeId: zod.string().min(1, 'Fidan Türü zorunludur.'),
  plantVarietyId: zod.string().min(1, 'Fidan Çeşidi zorunludur.'),
});

type FormData = z.infer<typeof schema>;

interface ProductionBatchCreateFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProductionBatchCreateForm({ onClose, onSuccess }: ProductionBatchCreateFormProps): React.JSX.Element {
  const {
    handleSubmit,
    register,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ 
    resolver: zodResolver(schema),
    defaultValues: {
      description: null,
      expectedHarvestQuantity: undefined,
    }
  });

  // API endpoint'lerini server tarafındaki yollarla eşleştirin
  const { data: plantTypes, isLoading: isLoadingPlantTypes, error: plantTypesError } = useApi<PlantType[]>('/api/v1/plant-types');
  const { data: plantVarieties, isLoading: isLoadingPlantVarieties, error: plantVarietiesError } = useApi<PlantVariety[]>('/api/v1/plant-varieties');

  const selectedPlantTypeId = watch('plantTypeId');

  const filteredPlantVarieties = React.useMemo(() => {
    if (!plantVarieties || !selectedPlantTypeId) {
      return [];
    }
    return plantVarieties.filter(
      (variety) => variety.plantTypeId === selectedPlantTypeId
    );
  }, [plantVarieties, selectedPlantTypeId]);

  React.useEffect(() => {
    setValue('plantVarietyId', '', { shouldValidate: true });
  }, [selectedPlantTypeId, setValue]);

  const onSubmit = React.useCallback(
    async (data: FormData): Promise<void> => {
      try {
        // Doğrudan createProductionBatch fonksiyonunu kullanın
        await createProductionBatch({
          ...data,
          startDate: dayjs(data.startDate).toISOString(), // Tarihi ISO string olarak gönder
          expectedHarvestQuantity: data.expectedHarvestQuantity ?? undefined,
          description: data.description || undefined,
        });

        toast.success('Üretim partisi başarıyla oluşturuldu!');
        reset();
        onClose();
        onSuccess?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
        console.error("Form gönderme hatası:", err);
      }
    },
    [onClose, reset, onSuccess]
  );

  if (isLoadingPlantTypes || isLoadingPlantVarieties) {
    return <Typography>Fidan türleri ve çeşitleri yükleniyor...</Typography>;
  }

  if (plantTypesError || plantVarietiesError) {
    return <Typography color="error">Veriler yüklenirken bir hata oluştu: {(plantTypesError || plantVarietiesError)?.message}</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <TextField
            {...register('batchCode')}
            label="Parti Kodu"
            placeholder="örn: PRD-202501-CVZ001"
            error={!!errors.batchCode}
            helperText={errors.batchCode?.message}
            fullWidth
          />

          <TextField
            {...register('batchName')}
            label="Parti Adı"
            placeholder="örn: Ocak 2025 Aşılı Ceviz Fidanı Partisi"
            error={!!errors.batchName}
            helperText={errors.batchName?.message}
            fullWidth
          />

          <FormControl fullWidth error={!!errors.plantTypeId}>
            <InputLabel>Fidan Türü</InputLabel>
            <Controller
              name="plantTypeId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Fidan Türü"
                  onChange={(e) => {
                    field.onChange(e.target.value as string);
                  }}
                  value={field.value || ''}
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  {plantTypes?.map((type) => (
                    <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.plantTypeId && <Typography color="error" variant="caption">{errors.plantTypeId.message}</Typography>}
          </FormControl>

          <FormControl fullWidth error={!!errors.plantVarietyId}>
            <InputLabel>Fidan Çeşidi</InputLabel>
            <Controller
              name="plantVarietyId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Fidan Çeşidi"
                  onChange={(e) => {
                    field.onChange(e.target.value as string);
                  }}
                  value={field.value || ''}
                  disabled={!selectedPlantTypeId || filteredPlantVarieties.length === 0}
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  {filteredPlantVarieties.map((variety) => (
                    <MenuItem key={variety.id} value={variety.id}>{variety.name}</MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.plantVarietyId && <Typography color="error" variant="caption">{errors.plantVarietyId.message}</Typography>}
          </FormControl>

          <FormControl fullWidth error={!!errors.startDate}>
            <FormLabel>Başlangıç Tarihi</FormLabel>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  format="DD/MM/YYYY"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(newValue) => {
                    field.onChange(newValue ? (newValue as dayjs.Dayjs).toDate() : null);
                  }}
                  slotProps={{ textField: { error: !!errors.startDate, helperText: errors.startDate?.message } }}
                />
              )}
            />
          </FormControl>

          <TextField
            {...register('initialQuantity', { valueAsNumber: true })}
            label="Başlangıç Adedi (Fidan)"
            type="number"
            placeholder="Başlangıç fidan adedini girin"
            error={!!errors.initialQuantity}
            helperText={errors.initialQuantity?.message}
            fullWidth
          />

          <TextField
            {...register('expectedHarvestQuantity', { valueAsNumber: true })}
            label="Beklenen Hasat Adedi (Opsiyonel)"
            type="number"
            placeholder="Tahmini hasat adedini girin"
            error={!!errors.expectedHarvestQuantity}
            helperText={errors.expectedHarvestQuantity?.message}
            fullWidth
          />

          <TextField
            {...register('description')}
            label="Açıklama (Opsiyonel)"
            placeholder="Parti ile ilgili ek bilgiler"
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description?.message}
            fullWidth
          />

          <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="inherit" onClick={onClose} disabled={isSubmitting}>
              İptal
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Parti Oluştur
            </Button>
          </Stack>
        </Stack>
      </form>
    </LocalizationProvider>
  );
}