// Konum: src/components/dashboard/expense/expense-category-list.tsx
'use client';

import * as React from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert, Button, Card, Stack, TextField, CircularProgress, List, ListItem, ListItemText,
  CardContent, CardHeader, Divider, Typography
} from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import { useNotifier } from '@/hooks/useNotifier';
import type { ExpenseCategory } from '@/types/expense';
import { createExpenseCategory } from '@/api/expense';

const schema = zod.object({
  name: zod.string().min(2, 'Kategori adı en az 2 karakter olmalıdır.'),
  description: zod.string().optional(),
});
type FormValues = zod.infer<typeof schema>;

interface ExpenseCategoryListProps {
    categories: ExpenseCategory[];
    onUpdate: () => void; // Kategori eklendiğinde ana listeyi yenilemek için
}

export function ExpenseCategoryList({ categories, onUpdate }: ExpenseCategoryListProps): React.JSX.Element {
    const notify = useNotifier();
    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ 
      resolver: zodResolver(schema), 
      defaultValues: { name: '', description: '' } 
    });

    const onSubmit = React.useCallback(async (values: FormValues) => {
        try {
            await createExpenseCategory(values);
            reset();
            onUpdate();
            notify.success('Kategori başarıyla eklendi.');
        } catch (err) {
            notify.error(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
        }
    }, [onUpdate, reset, notify]);

    return (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
            <Card sx={{ flex: 1, width: '100%' }}>
                <CardHeader title="Mevcut Kategoriler" />
                <Divider />
                <List>
                    {categories.length > 0 ? categories.map((category, index) => (
                        <ListItem key={category.id} divider={index < categories.length - 1}>
                            <ListItemText primary={category.name} secondary={category.description} />
                        </ListItem>
                    )) : (
                        <ListItem>
                            <ListItemText secondary="Henüz bir kategori oluşturulmamış." />
                        </ListItem>
                    )}
                </List>
            </Card>
            <Card sx={{ flex: 1, width: '100%' }}>
                <CardHeader title="Yeni Kategori Ekle" />
                <Divider />
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={2}>
                            <Controller name="name" control={control} render={({ field }) => ( <TextField {...field} label="Kategori Adı" fullWidth required error={Boolean(errors.name)} helperText={errors.name?.message} /> )}/>
                            <Controller name="description" control={control} render={({ field }) => ( <TextField {...field} label="Açıklama (Opsiyonel)" fullWidth multiline rows={2} /> )}/>
                            <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={<PlusIcon />}>
                                {isSubmitting ? <CircularProgress size={24} /> : 'Kategori Ekle'}
                            </Button>
                        </Stack>
                    </form>
                </CardContent>
            </Card>
        </Stack>
    );
}