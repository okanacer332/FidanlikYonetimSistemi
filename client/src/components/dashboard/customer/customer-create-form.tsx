// client/src/components/dashboard/customer/customer-create-form.tsx
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormHelperText, InputLabel, OutlinedInput, Stack, CircularProgress
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import type { CustomerCreate } from '@/types/nursery';

const schema = zod.object({
  firstName: zod.string().min(1, { message: 'Ad alanı gereklidir.' }),
  lastName: zod.string().min(1, { message: 'Soyad alanı gereklidir.' }),
  companyName: zod.string().optional(),
  phone: zod.string().min(10, { message: 'Geçerli bir telefon numarası giriniz.' }).max(20),
  email: zod.string().email({ message: 'Geçerli bir e-posta adresi giriniz.' }),
  address: zod.string().min(5, { message: 'Adres en az 5 karakter olmalıdır.' })
});

interface CustomerCreateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomerCreateForm({ open, onClose, onSuccess }: CustomerCreateFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CustomerCreate>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', companyName: '', phone: '', email: '', address: '' },
  });

  React.useEffect(() => {
    if (!open) {
      reset();
      setFormError(null);
    }
  }, [open, reset]);

  const onSubmit = React.useCallback(async (values: CustomerCreate): Promise<void> => {
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Müşteri oluşturulamadı.');
      }
      onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    }
  }, [onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <Controller name="firstName" control={control} render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.firstName)}>
                  <InputLabel required>Adı</InputLabel>
                  <OutlinedInput {...field} label="Adı" />
                  {errors.firstName && <FormHelperText>{errors.firstName.message}</FormHelperText>}
                </FormControl>
              )} />
              <Controller name="lastName" control={control} render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.lastName)}>
                  <InputLabel required>Soyadı</InputLabel>
                  <OutlinedInput {...field} label="Soyadı" />
                  {errors.lastName && <FormHelperText>{errors.lastName.message}</FormHelperText>}
                </FormControl>
              )} />
              <Controller name="companyName" control={control} render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.companyName)}>
                  <InputLabel>Şirket Adı</InputLabel>
                  <OutlinedInput {...field} label="Şirket Adı" />
                  {errors.companyName && <FormHelperText>{errors.companyName.message}</FormHelperText>}
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
                  <InputLabel required>E-posta</InputLabel>
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