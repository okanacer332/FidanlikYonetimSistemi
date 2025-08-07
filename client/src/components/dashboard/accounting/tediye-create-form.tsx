// Konum: src/components/dashboard/accounting/tediye-create-form.tsx
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

import type { Supplier, Transaction } from '@/types/nursery'; // <-- Transaction tipini import et
import { PaymentMethod } from '@/types/nursery';

const schema = zod.object({
  supplierId: zod.string().min(1, 'Tedarikçi seçimi zorunludur.'),
  amount: zod.coerce.number().positive({ message: 'Tutar 0\'dan büyük olmalıdır.' }),
  paymentDate: zod.string().min(1, 'Ödeme tarihi zorunludur.'),
  method: zod.nativeEnum(PaymentMethod),
  description: zod.string().min(1, 'Açıklama zorunludur.'),
});

type FormValues = zod.infer<typeof schema>;

interface TediyeCreateFormProps {
  onClose?: () => void;
  onSuccess: (newTransaction: Transaction) => void; // <-- DEĞİŞİKLİK: onSuccess'i güncelle
  suppliers: Supplier[];
  preselectedSupplierId?: string | null;
}

export function TediyeCreateForm({
  onClose,
  onSuccess,
  suppliers,
  preselectedSupplierId,
}: TediyeCreateFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);

  const defaultValues = React.useMemo(() => ({
    supplierId: preselectedSupplierId || '',
    amount: 0,
    paymentDate: dayjs().format('YYYY-MM-DD'),
    method: PaymentMethod.BANK_TRANSFER,
    description: '',
  }), [preselectedSupplierId]);

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/payment-to-supplier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
      });
      
      const newTransactionData = await response.json();

      if (!response.ok) {
        throw new Error(newTransactionData.message || 'Tediye kaydedilemedi.');
      }
      onSuccess(newTransactionData); // <-- DEĞİŞİKLİK: Yeni veriyi geri döndür
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
                {isSubmitting ? <CircularProgress size={24} /> : 'Tediyeyi Kaydet'}
            </Button>
        </Stack>
      </Stack>
    </form>
  );
}