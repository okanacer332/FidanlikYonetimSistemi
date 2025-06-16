// Tam Dosya Yolu: client/src/components/dashboard/nursery/plant-type-edit-form.tsx
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

import type { PlantType, PlantTypeUpdate } from '@/types/nursery';

const schema = zod.object({
  name: zod.string().min(2, { message: 'Fidan türü adı en az 2 karakter olmalıdır.' }),
});

interface PlantTypeEditFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plantType: PlantType | null;
}

export function PlantTypeEditForm({ open, onClose, onSuccess, plantType }: PlantTypeEditFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PlantTypeUpdate>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  React.useEffect(() => {
    if (open && plantType) {
      reset({ name: plantType.name });
      setFormError(null);
    }
  }, [open, plantType, reset]);

  const onSubmit = React.useCallback(
    async (values: PlantTypeUpdate): Promise<void> => {
      if (!plantType) return;
      setFormError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum tokenı bulunamadı.');

        // ----- DÜZELTİLMİŞ VE TEMİZLENMİŞ SATIR -----
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plant-types/${plantType.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(values),
        });
        // ------------------------------------------

        if (!response.ok) {
          // Eğer cevap JSON değilse (hata sayfası gibi), ona göre bir mesaj gösterelim.
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Güncelleme başarısız.');
          } else {
            throw new Error('Sunucudan beklenmeyen bir cevap alındı. Lütfen backend loglarını kontrol edin.');
          }
        }
        
        onSuccess();
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Bir hata oluştu.');
      }
    },
    [plantType, onSuccess]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Fidan Türünü Düzenle</DialogTitle>
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
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Kaydet
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}