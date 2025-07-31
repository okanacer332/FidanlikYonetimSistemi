'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z as zod } from 'zod';
import { toast } from 'react-hot-toast';
import {
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  FormLabel, // YENİ: FormLabel import edildi
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { createExpense } from '@/api/expense';
import type { ExpenseCategory } from '@/types/expense';

interface ExpenseCreateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: ExpenseCategory[];
}

const schema = zod.object({
  description: zod.string().min(1, 'Açıklama zorunludur.'),
  amount: zod.number().min(0.01, 'Tutar 0.01\'den büyük olmalıdır.'),
  expenseDate: zod.date({ required_error: 'Gider tarihi zorunludur.' }),
  categoryId: zod.string().min(1, 'Kategori seçimi zorunludur.'),
});

type FormData = zod.infer<typeof schema>;

export function ExpenseCreateForm({ open, onClose, onSuccess, categories }: ExpenseCreateFormProps): React.JSX.Element {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, categoryId: '', description: '', expenseDate: new Date() },
  });

  const onSubmit = React.useCallback(
    async (data: FormData) => {
      try {
        await createExpense({
          ...data,
          expenseDate: dayjs(data.expenseDate).toISOString(),
        });
        toast.success('Gider başarıyla oluşturuldu!');
        reset();
        onSuccess();
        onClose();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      }
    },
    [reset, onSuccess, onClose]
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Yeni Gider Ekle</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Açıklama"
                fullWidth
                {...control.register('description')}
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
              />
              <TextField
                label="Tutar"
                type="number"
                fullWidth
                {...control.register('amount', { valueAsNumber: true })}
                error={Boolean(errors.amount)}
                helperText={errors.amount?.message}
              />
              <FormControl fullWidth error={Boolean(errors.categoryId)}>
                <InputLabel>Kategori</InputLabel>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Kategori"
                      value={field.value || ''}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.categoryId && <FormHelperText>{errors.categoryId.message}</FormHelperText>}
              </FormControl>
              <FormControl fullWidth error={Boolean(errors.expenseDate)}>
                <FormLabel>Gider Tarihi</FormLabel>
                <Controller
                  name="expenseDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(newValue) => field.onChange(newValue ? (newValue as dayjs.Dayjs).toDate() : null)}
                      slotProps={{ textField: { fullWidth: true, error: Boolean(errors.expenseDate), helperText: errors.expenseDate?.message } }}
                    />
                  )}
                />
              </FormControl>
            </Stack>
          </form>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">İptal</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} /> : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}