// Konum: src/components/dashboard/accounting/collection-create-form.tsx
'use client';

import * as React from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert, Button, FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack,
  TextField, CircularProgress, Grid
} from '@mui/material';
import dayjs from 'dayjs';

import type { Customer, Transaction } from '@/types/nursery'; // <-- Transaction tipini import et
import { PaymentMethod } from '@/types/nursery';

const schema = zod.object({
  customerId: zod.string().min(1, 'Müşteri seçimi zorunludur.'),
  amount: zod.coerce.number().positive({ message: 'Tutar 0\'dan büyük olmalıdır.' }),
  paymentDate: zod.string().min(1, 'Ödeme tarihi zorunludur.'),
  method: zod.nativeEnum(PaymentMethod),
  description: zod.string().min(1, 'Açıklama zorunludur.'),
});

type FormValues = zod.infer<typeof schema>;

interface CollectionCreateFormProps {
  onClose?: () => void;
  // <-- DEĞİŞİKLİK: onSuccess artık yeni Transaction objesini parametre alacak
  onSuccess: (newTransaction: Transaction) => void;
  customers: Customer[];
  preselectedCustomerId?: string | null;
}

export function CollectionCreateForm({
  onClose,
  onSuccess,
  customers,
  preselectedCustomerId,
}: CollectionCreateFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);

  const defaultValues = React.useMemo(() => ({
    customerId: preselectedCustomerId || '',
    amount: 0,
    paymentDate: dayjs().format('YYYY-MM-DD'),
    method: PaymentMethod.CASH,
    description: '',
  }), [preselectedCustomerId]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  React.useEffect(() => {
    reset(defaultValues);
    setFormError(null);
  }, [reset, defaultValues]);

  const onSubmit = React.useCallback(async (values: FormValues): Promise<void> => {
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/collection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
      });

      // API'den dönen yeni veriyi al
      const newTransactionData = await response.json();

      if (!response.ok) {
        throw new Error(newTransactionData.message || 'Tahsilat kaydedilemedi.');
      }
      // <-- DEĞİŞİKLİK: Yeni veriyi onSuccess callback'i ile ana sayfaya gönder
      onSuccess(newTransactionData);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    }
  }, [onSuccess]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => ( <TextField {...field} label="Tutar" type="number" inputProps={{ step: '0.01' }} fullWidth required size="small" error={Boolean(errors.amount)} helperText={errors.amount?.message} /> )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="paymentDate"
              control={control}
              render={({ field }) => ( <TextField {...field} label="Ödeme Tarihi" type="date" fullWidth required InputLabelProps={{ shrink: true }} size="small" error={Boolean(errors.paymentDate)} helperText={errors.paymentDate?.message} /> )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="method"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.method)} size="small">
                  <InputLabel required>Ödeme Yöntemi</InputLabel>
                  <Select {...field} label="Ödeme Yöntemi">
                    <MenuItem value={PaymentMethod.CASH}>Nakit</MenuItem>
                    <MenuItem value={PaymentMethod.BANK_TRANSFER}>Banka Transferi</MenuItem>
                    <MenuItem value={PaymentMethod.CREDIT_CARD}>Kredi Kartı</MenuItem>
                  </Select>
                  {errors.method && <FormHelperText>{errors.method.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => ( <TextField {...field} label="Açıklama" fullWidth required size="small" error={Boolean(errors.description)} helperText={errors.description?.message} /> )}
            />
          </Grid>
        </Grid>
        {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={onClose} disabled={isSubmitting} color="secondary">İptal</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Tahsilatı Kaydet'}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}