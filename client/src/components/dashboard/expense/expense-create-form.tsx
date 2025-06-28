'use client';

import * as React from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack,
  TextField, CircularProgress, Autocomplete
} from '@mui/material';
import dayjs from 'dayjs';

import type { ExpenseCategory, ProductionBatch } from '@/types/nursery';
import { PaymentMethod } from '@/types/nursery';

const schema = zod.object({
  amount: zod.coerce.number().positive({ message: 'Tutar 0\'dan büyük olmalıdır.' }),
  expenseDate: zod.string().min(1, 'Gider tarihi zorunludur.'),
  categoryId: zod.string().min(1, 'Kategori seçimi zorunludur.'),
  paymentMethod: zod.nativeEnum(PaymentMethod),
  description: zod.string().min(1, 'Açıklama zorunludur.'),
  productionBatchId: zod.string().optional(),
});

type FormValues = zod.infer<typeof schema>;

interface ExpenseCreateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: ExpenseCategory[];
  productionBatches: ProductionBatch[];
}

export function ExpenseCreateForm({ open, onClose, onSuccess, categories, productionBatches }: ExpenseCreateFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);

  const defaultValues = React.useMemo(() => ({
    amount: 0,
    expenseDate: dayjs().format('YYYY-MM-DD'),
    categoryId: '',
    paymentMethod: PaymentMethod.CASH,
    description: '',
    productionBatchId: undefined,
  }), []);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  React.useEffect(() => {
    if (open) {
      reset(defaultValues);
      setFormError(null);
    }
  }, [open, reset, defaultValues]);

  // Eklenen console.log: productionBatches verisini kontrol etmek için
  React.useEffect(() => {
    console.log('ExpenseCreateForm: productionBatches prop değeri:', productionBatches);
    if (productionBatches.length === 0) {
      console.log('ExpenseCreateForm: Üretim partisi verisi boş veya gelmiyor.');
    }
  }, [productionBatches]);


  const onSubmit = React.useCallback(async (values: FormValues) => {
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı.');

      const dataToSend = {
        ...values,
        productionBatchId: values.productionBatchId === '' ? undefined : values.productionBatchId,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gider kaydedilemedi.');
      }
      onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    }
  }, [onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Gider Ekle</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
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
              name="expenseDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Gider Tarihi"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  error={Boolean(errors.expenseDate)}
                  helperText={errors.expenseDate?.message}
                />
              )}
            />
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.categoryId)}>
                  <InputLabel required>Kategori</InputLabel>
                  <Select {...field} label="Kategori">
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                  {errors.categoryId && <FormHelperText>{errors.categoryId.message}</FormHelperText>}
                </FormControl>
              )}
            />
             <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.paymentMethod)}>
                  <InputLabel required>Ödeme Yöntemi</InputLabel>
                  <Select {...field} label="Ödeme Yöntemi">
                    <MenuItem value={PaymentMethod.CASH}>Nakit</MenuItem>
                    <MenuItem value={PaymentMethod.BANK_TRANSFER}>Banka Transferi</MenuItem>
                    <MenuItem value={PaymentMethod.CREDIT_CARD}>Kredi Kartı</MenuItem>
                  </Select>
                  {errors.paymentMethod && <FormHelperText>{errors.paymentMethod.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <Controller
              name="productionBatchId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  // value prop'u, field.value'nun ProductionBatch objesine eşleşmesi için güncellendi
                  // Eğer field.value bir ID ise, productionBatches dizisinde bu ID'ye sahip objeyi arar.
                  value={
                    field.value
                      ? productionBatches.find((batch) => batch.id === field.value) || null
                      : null
                  }
                  onChange={(_, newValue) => {
                    setValue('productionBatchId', newValue?.id || '');
                  }}
                  options={productionBatches}
                  // getOptionLabel artık 'batchName' özelliğini kullanıyor
                  // Her bir seçeneğin benzersiz bir 'key'e sahip olması için 'option.id' kullanıldı
                  getOptionLabel={(option) => option.batchName || ''}
                  // isOptionEqualToValue null kontrolü için güncellendi
                  isOptionEqualToValue={(option, value) => option.id === (value ? value.id : '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="İlgili Üretim Partisi (Opsiyonel)"
                      placeholder="Parti Seçin"
                      error={Boolean(errors.productionBatchId)}
                      helperText={errors.productionBatchId?.message}
                    />
                  )}
                  // Autocomplete bileşenine benzersiz key vermek için getOptionKey kullanıldı
                  // Bu, "Encountered two children with the same key" hatasını önler.
                  // options dizisindeki her öğenin benzersiz bir 'id'ye sahip olduğunu varsayarız.
                  getOptionKey={(option) => option.id}
                />
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
