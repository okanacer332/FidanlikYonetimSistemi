// Dosya Yolu: client/src/components/dashboard/warehouse/warehouse-create-form.tsx
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormHelperText, InputLabel, OutlinedInput, Stack, CircularProgress
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import type { WarehouseCreate } from '@/types/nursery';

const schema = zod.object({
  name: zod.string().min(2, { message: 'Depo adı en az 2 karakter olmalıdır.' }),
  address: zod.string().min(5, { message: 'Adres en az 5 karakter olmalıdır.' })
});

interface WarehouseCreateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WarehouseCreateForm({ open, onClose, onSuccess }: WarehouseCreateFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<WarehouseCreate>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', address: '' },
  });

  React.useEffect(() => {
    if (!open) {
      reset();
      setFormError(null);
    }
  }, [open, reset]);

  const onSubmit = React.useCallback(async (values: WarehouseCreate): Promise<void> => {
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/warehouses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Depo oluşturulamadı.');
      }
      onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    }
  }, [onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Depo Ekle</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <Controller name="name" control={control} render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.name)}>
                  <InputLabel required>Depo Adı</InputLabel>
                  <OutlinedInput {...field} label="Depo Adı" />
                  {errors.name && <FormHelperText>{errors.name.message}</FormHelperText>}
                </FormControl>
              )} />
              <Controller name="address" control={control} render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.address)}>
                  <InputLabel required>Adres</InputLabel>
                  <OutlinedInput {...field} label="Adres" multiline rows={3} />
                  {errors.address && <FormHelperText>{errors.address.message}</FormHelperText>}
                </FormControl>
              )} />
              {formError && <Alert severity="error">{formError}</Alert>}
            </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>İptal</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Oluştur'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}