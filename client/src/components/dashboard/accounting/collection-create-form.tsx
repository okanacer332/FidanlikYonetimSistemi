'use client';

import * as React from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack,
  TextField, CircularProgress, Typography
} from '@mui/material';
import dayjs from 'dayjs';

import type { Customer } from '@/types/nursery';
import { PaymentMethod } from '@/types/nursery';

const schema = zod.object({
  customerId: zod.string().min(1, 'Müşteri seçimi zorunludur.'),
  amount: zod.coerce.number().positive({ message: 'Tutar 0\'dan büyük olmalıdır.' }),
  paymentDate: zod.string().min(1, 'Ödeme tarihi zorunludur.'),
  method: zod.nativeEnum(PaymentMethod),
  description: zod.string().min(1, 'Açıklama zorunludur.'),
  invoiceId: zod.string().optional(),
});

type FormValues = zod.infer<typeof schema>;

interface CollectionCreateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customers: Customer[];
  // Opsiyonel olarak, belirli bir müşteri önceden seçili gelebilir
  preselectedCustomerId?: string | null;
}

export function CollectionCreateForm({
  open,
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
    invoiceId: '',
  }), [preselectedCustomerId]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  React.useEffect(() => {
    if (open) {
      reset(defaultValues);
      setFormError(null);
    }
  }, [open, reset, defaultValues]);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Tahsilat kaydedilemedi.');
      }
      onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    }
  }, [onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Tahsilat Ekle</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <Controller
              name="customerId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.customerId)}>
                  <InputLabel required>Müşteri</InputLabel>
                  <Select {...field} label="Müşteri" disabled={!!preselectedCustomerId}>
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.customerId && <FormHelperText>{errors.customerId.message}</FormHelperText>}
                </FormControl>
              )}
            />
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tutar"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  fullWidth
                  required
                  error={Boolean(errors.amount)}
                  helperText={errors.amount?.message}
                />
              )}
            />
            <Controller
              name="paymentDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Ödeme Tarihi"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  error={Boolean(errors.paymentDate)}
                  helperText={errors.paymentDate?.message}
                />
              )}
            />
            <Controller
              name="method"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.method)}>
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
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Açıklama"
                  fullWidth
                  required
                  multiline
                  rows={2}
                  error={Boolean(errors.description)}
                  helperText={errors.description?.message}
                />
              )}
            />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>İptal</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
