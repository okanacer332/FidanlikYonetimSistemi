'use client';

import * as React from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack, TextField,
} from '@mui/material';
import type { InflationRate } from '@/types/nursery';

const schema = zod.object({
  year: zod.coerce.number().min(2000, 'Yıl 2000\'den küçük olamaz.').max(2100, 'Yıl 2100\'den büyük olamaz.'),
  month: zod.coerce.number().min(1, 'Ay 1-12 arasında olmalıdır.').max(12, 'Ay 1-12 arasında olmalıdır.'),
  rate: zod.coerce.number().min(0, 'Oran negatif olamaz.'),
});

type FormValues = zod.infer<typeof schema>;

interface InflationRateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inflationRate: InflationRate | null; // Düzenlenecek oran (null ise yeni kayıt)
}

export function InflationRateForm({ open, onClose, onSuccess, inflationRate }: InflationRateFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { year: new Date().getFullYear(), month: new Date().getMonth() + 1, rate: 0 },
  });

  React.useEffect(() => {
    if (open) {
      // Formu düzenleme modunda ise gelen veriyle, aksi halde varsayılan değerlerle resetle
      if (inflationRate) {
        reset({
          year: inflationRate.year,
          month: inflationRate.month,
          rate: inflationRate.rate,
        });
      } else {
        reset({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, rate: 0 });
      }
      setFormError(null);
    }
  }, [open, inflationRate, reset]);

  const onSubmit = React.useCallback(async (values: FormValues): Promise<void> => {
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');

      const url = inflationRate
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/inflation-rates/${inflationRate.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/inflation-rates`;
      const method = inflationRate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'İşlem başarısız.');
      }
      onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    }
  }, [inflationRate, onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{inflationRate ? 'Enflasyon Oranını Düzenle' : 'Yeni Enflasyon Oranı Ekle'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <Controller
              name="year"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Yıl"
                  type="number"
                  fullWidth
                  required
                  error={Boolean(errors.year)}
                  helperText={errors.year?.message}
                />
              )}
            />
            <Controller
              name="month"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.month)}>
                  <InputLabel required>Ay</InputLabel>
                  <Select {...field} label="Ay">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((monthNum) => (
                      <MenuItem key={monthNum} value={monthNum}>
                        {monthNum}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.month && <FormHelperText>{errors.month.message}</FormHelperText>}
                </FormControl>
              )}
            />
            <Controller
              name="rate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Oran (%)"
                  type="number"
                  inputProps={{ step: '0.001' }} // Ondalıklı sayı girişi için
                  fullWidth
                  required
                  error={Boolean(errors.rate)}
                  helperText={errors.rate?.message}
                />
              )}
            />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>İptal</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : (inflationRate ? 'Kaydet' : 'Oluştur')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}