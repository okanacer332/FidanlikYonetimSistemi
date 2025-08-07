// Konum: src/components/dashboard/expense/expense-category-edit-form.tsx
'use client';

import * as React from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField
} from '@mui/material';
import type { ExpenseCategory } from '@/types/expense';
import { updateExpenseCategory } from '@/api/expense';

const schema = zod.object({
  name: zod.string().min(2, 'Kategori adı en az 2 karakter olmalıdır.'),
  description: zod.string().optional(),
});
type FormValues = zod.infer<typeof schema>;

interface ExpenseCategoryEditFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: ExpenseCategory | null;
}

export function ExpenseCategoryEditForm({ open, onClose, onSuccess, category }: ExpenseCategoryEditFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    if (category && open) {
      reset({ name: category.name, description: category.description });
      setFormError(null);
    }
  }, [category, open, reset]);

  const onSubmit = React.useCallback(async (values: FormValues) => {
    if (!category) return;
    try {
      await updateExpenseCategory(category.id, values);
      onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    }
  }, [category, onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Kategoriyi Düzenle</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller name="name" control={control} render={({ field }) => ( <TextField {...field} label="Kategori Adı" fullWidth required error={!!errors.name} helperText={errors.name?.message} /> )}/>
            <Controller name="description" control={control} render={({ field }) => ( <TextField {...field} label="Açıklama" fullWidth multiline rows={2} /> )}/>
            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>İptal</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? <CircularProgress size={24} /> : 'Kaydet'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}