'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import type { z } from 'zod';
import { z as zod } from 'zod';
import { toast } from 'react-hot-toast';

import {
  Button,
  FormControl,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Typography from '@mui/material/Typography';

import { useApi } from '@/hooks/use-api';
import { createExpense } from '@/api/expense'; // Yeni createExpense API fonksiyonu
import type { ExpenseCategory } from '@/types/expense'; // ExpenseCategory tipi

interface AddExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productionBatchId: string; // Giderin ilişkilendirileceği üretim partisinin ID'si
}

const schema = zod.object({
  description: zod.string().min(1, 'Gider açıklaması zorunludur.').max(200, 'Açıklama en fazla 200 karakter olabilir.'),
  amount: zod.number().min(0.01, 'Gider tutarı en az 0.01 olmalıdır.'),
  expenseDate: zod.date({ required_error: 'Gider tarihi zorunludur.' }),
  categoryId: zod.string().min(1, 'Gider kategorisi seçimi zorunludur.'),
});

type FormData = z.infer<typeof schema>;

export function AddExpenseForm({ open, onClose, onSuccess, productionBatchId }: AddExpenseFormProps): React.JSX.Element {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ 
    resolver: zodResolver(schema),
    defaultValues: {
      expenseDate: new Date(),
    }
  });

  // Gider kategorilerini çekme
  const { data: expenseCategories, isLoading: isLoadingCategories, error: categoriesError } = useApi<ExpenseCategory[]>('/api/v1/expense-categories');

  const onSubmit = React.useCallback(
    async (data: FormData): Promise<void> => {
      try {
        await createExpense({
          ...data,
          // Gideri üretim partisiyle ilişkilendir
          productionBatchId: productionBatchId,
          expenseDate: dayjs(data.expenseDate).toISOString(),
        });

        toast.success('Gider başarıyla kaydedildi!');
        reset();
        onClose();
        onSuccess?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
        console.error("Gider kaydetme hatası:", err);
      }
    },
    [onClose, onSuccess, reset, productionBatchId]
  );

  if (isLoadingCategories) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Gider Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
          <Typography textAlign="center">Gider kategorileri yükleniyor...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (categoriesError) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Gider Ekle</DialogTitle>
        <DialogContent>
          <Typography color="error">Kategori verileri yüklenirken hata oluştu: {categoriesError.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Kapat</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Üretim Partisine Gider Ekle</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bu gidere ait bilgileri girin. Gider otomatik olarak ilgili üretim partisine işlenecektir.
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)} style={{ paddingTop: '16px' }}>
            <Stack spacing={2}>
              <TextField
                {...register('description')}
                label="Açıklama"
                placeholder="Gider açıklaması"
                error={!!errors.description}
                helperText={errors.description?.message}
                fullWidth
              />
              <TextField
                {...register('amount', { valueAsNumber: true })}
                label="Tutar"
                type="number"
                placeholder="Gider tutarını girin"
                error={!!errors.amount}
                helperText={errors.amount?.message}
                fullWidth
              />
              <FormControl fullWidth error={!!errors.categoryId}>
                <InputLabel>Gider Kategorisi</InputLabel>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Gider Kategorisi"
                      onChange={(e) => field.onChange(e.target.value as string)}
                      value={field.value || ''}
                    >
                      <MenuItem value="">Seçiniz</MenuItem>
                      {expenseCategories?.map((category) => (
                        <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.categoryId && <Typography color="error" variant="caption">{errors.categoryId.message}</Typography>}
              </FormControl>
              <FormControl fullWidth error={!!errors.expenseDate}>
                <FormLabel>Gider Tarihi</FormLabel>
                <Controller
                  name="expenseDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      format="DD/MM/YYYY"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(newValue) => {
                        field.onChange(newValue ? (newValue as dayjs.Dayjs).toDate() : null);
                      }}
                      slotProps={{ textField: { error: !!errors.expenseDate, helperText: errors.expenseDate?.message } }}
                    />
                  )}
                />
              </FormControl>
            </Stack>
            <DialogActions sx={{ p: 0, pt: 3 }}>
              <Button variant="outlined" color="inherit" onClick={onClose} disabled={isSubmitting}>
                İptal
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                Kaydet
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
}