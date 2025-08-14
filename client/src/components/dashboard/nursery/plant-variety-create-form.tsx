// client/src/components/dashboard/nursery/plant-variety-create-form.tsx
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
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import type { PlantVariety, PlantVarietyCreate } from '@/types/nursery';

const schema = zod.object({
  name: zod.string().min(2, { message: 'Fidan çeşidi adı gereklidir.' }),
  plantTypeId: zod.string(),
});

interface PlantVarietyCreateFormProps {
  open: boolean;
  onClose: () => void;
  // DÜZELTME: onSuccess prop'u güncellendi
  onSuccess: (newPlantVariety: PlantVariety) => void | Promise<void>;
  plantTypeId: string | null;
}

export function PlantVarietyCreateForm({ open, onClose, onSuccess, plantTypeId }: PlantVarietyCreateFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);
  const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<PlantVarietyCreate>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', plantTypeId: '' },
  });
  
  React.useEffect(() => {
    if (open) {
      if(plantTypeId) setValue('plantTypeId', plantTypeId);
    } else {
      reset();
      setFormError(null);
    }
  }, [open, plantTypeId, reset, setValue]);

  const onSubmit = React.useCallback(async (values: PlantVarietyCreate): Promise<void> => {
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum tokenı bulunamadı.');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plant-varieties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kayıt başarısız.');
      }
      
      // DÜZELTME: Yeni oluşturulan veriyi al ve onSuccess ile geri gönder
      const newPlantVariety = await response.json();
      onSuccess(newPlantVariety);

    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    }
  }, [onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Fidan Çeşidi Ekle</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Controller name="name" control={control} render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.name)}>
                  <InputLabel required>Çeşit Adı</InputLabel>
                  <OutlinedInput {...field} label="Çeşit Adı" />
                  {errors.name && <FormHelperText>{errors.name.message}</FormHelperText>}
                </FormControl>
              )} />
              {formError && <Alert severity="error">{formError}</Alert>}
            </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>İptal</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>Oluştur</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}