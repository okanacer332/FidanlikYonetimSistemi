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
// DÜZELTME 1: Geri dönen verinin tipini belirtmek için PlantType import edildi.
import type { PlantType, PlantTypeCreate } from '@/types/nursery';

const schema = zod.object({
  name: zod.string().min(2, { message: 'Fidan türü adı en az 2 karakter olmalıdır.' }),
});

interface PlantTypeCreateFormProps {
  open: boolean;
  onClose: () => void;
  // DÜZELTME 2: onSuccess prop'u Promise<void> kabul edecek şekilde güncellendi.
  onSuccess: (newPlantType: PlantType) => void | Promise<void>;
}

export function PlantTypeCreateForm({ open, onClose, onSuccess }: PlantTypeCreateFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PlantTypeCreate>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  React.useEffect(() => {
    if (!open) {
      reset();
      setFormError(null);
    }
  }, [open, reset]);

  const onSubmit = React.useCallback(async (values: PlantTypeCreate): Promise<void> => {
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum tokenı bulunamadı.');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plant-types`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kayıt başarısız.');
      }
      
      // API'den dönen yeni objeyi al
      const newPlantType = await response.json();
      
      // Ana componente bu yeni objeyi gönder
      onSuccess(newPlantType);

    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    }
  }, [onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Fidan Türü Ekle</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.name)}>
                    <InputLabel required>Tür Adı</InputLabel>
                    <OutlinedInput {...field} label="Tür Adı" />
                    {errors.name && <FormHelperText>{errors.name.message}</FormHelperText>}
                  </FormControl>
                )}
              />
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