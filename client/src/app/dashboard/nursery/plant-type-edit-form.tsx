// client/src/components/dashboard/nursery/plant-type-edit-form.tsx
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
  name: zod.string().min(1, { message: 'Fidan türü adı gereklidir.' }),
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
    if (plantType) {
      reset({ name: plantType.name });
    }
  }, [plantType, reset]);

  const onSubmit = React.useCallback(
    async (values: PlantTypeUpdate): Promise<void> => {
      if (!plantType) return;
      setFormError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum tokenı bulunamadı.');

        const response = await fetch(`<span class="math-inline">\{process\.env\.NEXT\_PUBLIC\_API\_BASE\_URL\}/api/v1/plant\-types/</span>{plantType.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Güncelleme başarısız.');
        }

        reset();
        onSuccess();
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Bir hata oluştu.');
      }
    },
    [plantType, onSuccess, reset]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Fidan Türünü Düzenle</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.name)}>
                  <InputLabel>Tür Adı</InputLabel>
                  <OutlinedInput {...field} label="Tür Adı" />
                  {errors.name && <FormHelperText>{errors.name.message}</FormHelperText>}
                </FormControl>
              )}
            />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>İptal</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isSubmitting}>
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
}