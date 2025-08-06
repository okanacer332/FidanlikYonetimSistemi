'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z as zod } from 'zod';
import dayjs from 'dayjs';
import {
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import type { PlantType, PlantVariety, ProductionBatch } from '@/types/nursery';
import { createProductionBatch, type ProductionBatchCreatePayload } from '@/services/productionBatchService';

const schema = zod.object({
  batchCode: zod.string().min(1, 'Parti Kodu zorunludur.').max(50, 'En fazla 50 karakter.'),
  batchName: zod.string().min(1, 'Parti Adı zorunludur.').max(100, 'En fazla 100 karakter.'),
  startDate: zod.date({ required_error: 'Başlangıç Tarihi zorunludur.' }),
  initialQuantity: zod.coerce.number().min(1, 'Başlangıç Adedi en az 1 olmalıdır.').int('Tam sayı olmalıdır.'),
  plantTypeId: zod.string().min(1, 'Fidan Türü zorunludur.'),
  plantVarietyId: zod.string().min(1, 'Fidan Çeşidi zorunludur.'),
});

type FormData = zod.infer<typeof schema>;

const defaultValues: FormData = {
    batchCode: '',
    batchName: '',
    startDate: new Date(),
    initialQuantity: 1,
    plantTypeId: '',
    plantVarietyId: ''
};

interface ProductionBatchCreateFormProps {
  onSuccess: (newBatch: ProductionBatch) => void;
  onCancel: () => void;
  plantTypes: PlantType[];
  plantVarieties: PlantVariety[];
}

export function ProductionBatchCreateForm({ onSuccess, onCancel, plantTypes, plantVarieties }: ProductionBatchCreateFormProps): React.JSX.Element {
  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({ 
    resolver: zodResolver(schema),
    defaultValues: defaultValues
  });

  const selectedPlantTypeId = watch('plantTypeId');

  const filteredPlantVarieties = React.useMemo(() => {
    if (!plantVarieties || !selectedPlantTypeId) return [];
    return plantVarieties.filter((variety) => variety.plantTypeId === selectedPlantTypeId);
  }, [plantVarieties, selectedPlantTypeId]);

  React.useEffect(() => {
    setValue('plantVarietyId', '', { shouldValidate: true });
  }, [selectedPlantTypeId, setValue]);

  React.useEffect(() => {
    if (isSubmitSuccessful) {
      reset(defaultValues);
    }
  }, [isSubmitSuccessful, reset]);

  const onSubmit = React.useCallback(
    async (data: FormData): Promise<void> => {
      try {
        const payload: ProductionBatchCreatePayload = {
            batchCode: data.batchCode,
            batchName: data.batchName,
            initialQuantity: data.initialQuantity,
            plantTypeId: data.plantTypeId,
            plantVarietyId: data.plantVarietyId,
            startDate: data.startDate.toISOString(),
        };
        const newBatch = await createProductionBatch(payload);
        onSuccess(newBatch);
      } catch (err) {
        console.error("Form gönderme hatası:", err);
      }
    },
    [onSuccess]
  );

  return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
            <Controller name="batchCode" control={control} render={({ field }) => <TextField {...field} label="Parti Kodu" error={!!errors.batchCode} helperText={errors.batchCode?.message} fullWidth />}/>
            <Controller name="batchName" control={control} render={({ field }) => <TextField {...field} label="Parti Adı" error={!!errors.batchName} helperText={errors.batchName?.message} fullWidth />}/>
          </Stack>
          
          <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
            <FormControl fullWidth error={!!errors.plantTypeId}>
                <InputLabel>Fidan Türü</InputLabel>
                <Controller name="plantTypeId" control={control} render={({ field }) => ( <Select {...field} label="Fidan Türü"> {plantTypes.map((type) => ( <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem> ))} </Select> )}/>
                {errors.plantTypeId && <FormHelperText>{errors.plantTypeId.message}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={!!errors.plantVarietyId}>
                <InputLabel>Fidan Çeşidi</InputLabel>
                <Controller name="plantVarietyId" control={control} render={({ field }) => ( <Select {...field} label="Fidan Çeşidi" disabled={!selectedPlantTypeId || filteredPlantVarieties.length === 0}> {filteredPlantVarieties.map((variety) => ( <MenuItem key={variety.id} value={variety.id}>{variety.name}</MenuItem> ))} </Select> )}/>
                {errors.plantVarietyId && <FormHelperText>{errors.plantVarietyId.message}</FormHelperText>}
            </FormControl>
          </Stack>

          <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
            <Controller name="initialQuantity" control={control} render={({ field }) => ( <TextField {...field} label="Başlangıç Adedi" type="number" error={!!errors.initialQuantity} helperText={errors.initialQuantity?.message} fullWidth /> )}/>
            {/* --- BU SATIRDAKİ HATA KESİN OLARAK ÇÖZÜLDÜ --- */}
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Başlangıç Tarihi"
                  format="DD/MM/YYYY"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => {
                    const newDate = dayjs.isDayjs(date) ? date.toDate() : date;
                    field.onChange(newDate);
                  }}
                  slotProps={{ textField: { fullWidth: true, error: !!errors.startDate, helperText: errors.startDate?.message } }}
                />
              )}
            />
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="inherit" onClick={onCancel} disabled={isSubmitting}>
              İptal
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Parti Oluştur
            </Button>
          </Stack>
        </Stack>
      </form>
  );
}