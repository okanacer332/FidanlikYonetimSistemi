'use client';

import * as React from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import type { Expense, ExpenseCategory } from '@/types/nursery';
import { useApiSWR } from '@/hooks/use-api-swr';
import { createExpense } from '@/services/expenseService';

const schema = zod.object({
  description: zod.string().min(1, 'Açıklama zorunludur.'),
  amount: zod.coerce.number().positive('Tutar pozitif bir değer olmalıdır.'),
  categoryId: zod.string().min(1, 'Kategori seçimi zorunludur.'),
  expenseDate: zod.date({ required_error: 'Gider tarihi zorunludur.' }),
});

type FormData = zod.infer<typeof schema>;

interface AddExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productionBatchId: string;
}

export function AddExpenseForm({ open, onClose, onSuccess, productionBatchId }: AddExpenseFormProps): React.JSX.Element {
  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useApiSWR<ExpenseCategory[]>('/expense-categories');
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      amount: 0,
      categoryId: '',
      expenseDate: new Date(),
    },
  });
  
  React.useEffect(() => {
    if(!open) {
      reset({
        description: '',
        amount: 0,
        categoryId: '',
        expenseDate: new Date(),
      });
      setFormError(null);
    }
  }, [open, reset]);

  const onSubmit = React.useCallback(async (data: FormData) => {
    setFormError(null);
    try {
      const payload = {
        ...data,
        expenseDate: data.expenseDate.toISOString(),
        productionBatchId: productionBatchId,
      };
      await createExpense(payload);
      onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    }
  }, [productionBatchId, onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Partiye Gider Ekle</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {isLoadingCategories ? <CircularProgress /> : categoriesError ? <Alert severity="error">{categoriesError.message}</Alert> : (
              <>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Açıklama" fullWidth error={!!errors.description} helperText={errors.description?.message} />
                  )}
                />
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Tutar (₺)" type="number" fullWidth error={!!errors.amount} helperText={errors.amount?.message} />
                  )}
                />
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={categories || []}
                      getOptionLabel={(option) => option.name}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : '')}
                      renderInput={(params) => <TextField {...params} label="Gider Kategorisi" error={!!errors.categoryId} helperText={errors.categoryId?.message} />}
                    />
                  )}
                />
                {/* --- HATA BU SATIRDAYDI, KESİN ÇÖZÜM UYGULANDI --- */}
                <Controller
                  name="expenseDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Gider Tarihi"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => {
                        // Gelen değer Dayjs nesnesi ise .toDate() ile, değilse doğrudan kendisini ata.
                        const newDate = dayjs.isDayjs(date) ? date.toDate() : date;
                        field.onChange(newDate);
                      }}
                      slotProps={{ textField: { fullWidth: true, error: !!errors.expenseDate, helperText: errors.expenseDate?.message } }}
                    />
                  )}
                />
              </>
            )}
            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>İptal</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Gideri Kaydet'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}