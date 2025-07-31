'use client';

import * as React from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert, Button, Card, FormControl, FormHelperText, InputLabel,
  Stack, TextField, CircularProgress, List, ListItem, ListItemText,
  IconButton, CardContent, CardHeader, Divider
} from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
// Tip import'u düzeltildi
import type { ExpenseCategory } from '@/types/expense';
import { getExpenseCategories, createExpenseCategory } from '@/api/expense';

interface ExpenseCategoryListProps {
    categories: ExpenseCategory[];
    onUpdate: () => void;
}

const schema = zod.object({
  name: zod.string().min(2, 'Kategori adı en az 2 karakter olmalıdır.'),
  description: zod.string().optional(),
});

type FormValues = zod.infer<typeof schema>;

export function ExpenseCategoryList({ categories, onUpdate }: ExpenseCategoryListProps): React.JSX.Element {
    const [formError, setFormError] = React.useState<string | null>(null);
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', description: '' } });

    const onSubmit = React.useCallback(async (values: FormValues) => {
        setFormError(null);
        try {
            await createExpenseCategory(values);
            reset();
            onUpdate();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
        }
    }, [onUpdate, reset]);

    return (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
            <Card sx={{ flex: 1, width: '100%' }}>
                <CardHeader title="Mevcut Kategoriler" />
                <Divider />
                <List>
                    {categories.map((category, index) => (
                        <ListItem key={category.id} divider={index < categories.length - 1}>
                            <ListItemText primary={category.name} secondary={category.description} />
                        </ListItem>
                    ))}
                </List>
            </Card>
            <Card sx={{ flex: 1, width: '100%' }}>
                <CardHeader title="Yeni Kategori Ekle" />
                <Divider />
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={2}>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                    {...field}
                                    label="Kategori Adı"
                                    fullWidth
                                    required
                                    error={Boolean(errors.name)}
                                    helperText={errors.name?.message}
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
                                    multiline
                                    rows={2}
                                    />
                                )}
                            />
                            {formError && <Alert severity="error">{formError}</Alert>}
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