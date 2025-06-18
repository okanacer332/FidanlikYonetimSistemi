// client/src/components/dashboard/supplier/supplier-create-form.tsx
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormHelperText, InputLabel, OutlinedInput, Stack, CircularProgress
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import type { SupplierCreate } from '@/types/nursery';

const schema = zod.object({
  name: zod.string().min(2, { message: 'Tedarikçi adı en az 2 karakter olmalıdır.' }),
  contactPerson: zod.string().min(2, { message: 'Yetkili kişi adı en az 2 karakter olmalıdır.' }),
  phone: zod.string().min(10, { message: 'Geçerli bir telefon numarası giriniz.' }).max(20),
  email: zod.string().email({ message: 'Geçerli bir e-posta adresi giriniz.' }).optional().or(zod.literal('')),
  address: zod.string().min(5, { message: 'Adres en az 5 karakter olmalıdır.' })
});

interface SupplierCreateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SupplierCreateForm({ open, onClose, onSuccess }: SupplierCreateFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SupplierCreate>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', contactPerson: '', phone: '', email: '', address: '' },
  });

  React.useEffect(() => {
    if (!open) {
      reset();
      setFormError(null);
    }
  }, [open, reset]);

  const onSubmit = React.useCallback(async (values: SupplierCreate): Promise<void> => {
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Tedarikçi oluşturulamadı.');
      }
      onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    }
  }, [onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Tedarikçi Ekle</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <Controller name="name" control={control} render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.name)}>
                  <InputLabel required>Tedarikçi Adı</InputLabel>
                  <OutlinedInput {...field} label="Tedarikçi Adı" />
                  {errors.name && <FormHelperText>{errors.name.message}</FormHelperText>}
                </FormControl>
              )} />
              <Controller name="contactPerson" control={control} render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.contactPerson)}>
                  <InputLabel required>Yetkili Kişi</InputLabel>
                  <OutlinedInput {...field} label="Yetkili Kişi" />
                  {errors.contactPerson && <FormHelperText>{errors.contactPerson.message}</FormHelperText>}
                </FormControl>
              )} />
              <Controller name="phone" control={control} render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.phone)}>
                  <InputLabel required>Telefon</InputLabel>
                  <OutlinedInput {...field} label="Telefon" />
                  {errors.phone && <FormHelperText>{errors.phone.message}</FormHelperText>}
                </FormControl>
              )} />
              <Controller name="email" control={control} render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.email)}>
                  <InputLabel>E-posta</InputLabel>
                  <OutlinedInput {...field} label="E-posta" type="email" />
                  {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
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