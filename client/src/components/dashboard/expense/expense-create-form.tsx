// Konum: src/components/dashboard/expense/expense-create-form.tsx
'use client';

import * as React from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
// DÜZELTME 2: 'Stack' import'u eklendi
import { Alert, Button, CircularProgress, Grid, TextField, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import { ControlledAutocomplete } from '@/components/common/ControlledAutocomplete';
import type { ExpenseCategory, Expense } from '@/types/expense';
import { createExpense } from '@/api/expense';

const schema = zod.object({
  description: zod.string().min(1, 'Açıklama zorunludur.'),
  amount: zod.coerce.number().positive('Tutar 0\'dan büyük olmalıdır.'),
  expenseDate: zod.date({ required_error: 'Gider tarihi zorunludur.' }),
  categoryId: zod.string().min(1, 'Kategori seçimi zorunludur.'),
});
type FormValues = zod.infer<typeof schema>;

interface ExpenseCreateFormProps {
  onSuccess: (newExpense: Expense) => void;
  onCancel: () => void;
  categories: ExpenseCategory[];
}

export function ExpenseCreateForm({ onSuccess, onCancel, categories }: ExpenseCreateFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { description: '', amount: 0, expenseDate: new Date(), categoryId: '' },
  });

  const onSubmit = React.useCallback(async (values: FormValues) => {
    setFormError(null);
    try {
      const newExpense = await createExpense({ ...values, expenseDate: dayjs(values.expenseDate).toISOString() });
      reset();
      onSuccess(newExpense);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    }
  }, [onSuccess, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{p: 2}}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ControlledAutocomplete control={control} name="categoryId" label="Kategori" options={categories} size="small" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller name="description" control={control} render={({ field }) => <TextField {...field} label="Açıklama" required size="small" fullWidth error={!!errors.description} helperText={errors.description?.message} />} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller name="amount" control={control} render={({ field }) => <TextField {...field} label="Tutar" type="number" required size="small" fullWidth error={!!errors.amount} helperText={errors.amount?.message} />} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="expenseDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                value={dayjs(field.value)}
                onChange={(date) => {
                  // DÜZELTME 1: Gelen değerin Dayjs objesi olup olmadığını kontrol et
                  const newDate = dayjs.isDayjs(date) ? date.toDate() : date;
                  field.onChange(newDate);
                }}
                label="Gider Tarihi"
                slotProps={{ textField: { size: 'small', fullWidth: true, required: true, error: !!errors.expenseDate, helperText: errors.expenseDate?.message } }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          {formError && (<Alert severity="error" sx={{mt: 2}}>{formError}</Alert>)}
          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{mt: 2}}>
            <Button onClick={onCancel} disabled={isSubmitting} color="secondary">İptal</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? <CircularProgress size={24} /> : 'Gideri Kaydet'}</Button>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
}