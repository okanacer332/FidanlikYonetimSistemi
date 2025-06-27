'use client';

import * as React from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, FormHelperText, Stack
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import type { ProductionBatch } from '@/types/nursery';

const schema = z.object({
    batchName: z.string().min(3, 'Parti adı en az 3 karakter olmalıdır.'),
});

type FormValues = z.infer<typeof schema>;

interface ProductionBatchFormProps {
    open: boolean;
    onClose: (shouldRefresh: boolean) => void;
    batch: ProductionBatch | null;
}

export function ProductionBatchForm({ open, onClose, batch }: ProductionBatchFormProps): React.JSX.Element {
    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });
    
    const [apiError, setApiError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (batch) {
            reset({ batchName: batch.batchName });
        } else {
            reset({ batchName: '' });
        }
        setApiError(null);
    }, [batch, open, reset]);

    const onSubmit = async (values: FormValues) => {
        if (!batch) return;
        setApiError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/production-batches/${batch.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'İşlem başarısız oldu.');
            }
            onClose(true);
        } catch (err) {
            setApiError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
        }
    };
    
    return (
        <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Parti Adını Düzenle</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Controller
                            name="batchName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Parti Adı"
                                    fullWidth
                                    error={!!errors.batchName}
                                    helperText={errors.batchName?.message}
                                />
                            )}
                        />
                         {apiError && <FormHelperText error>{apiError}</FormHelperText>}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => onClose(false)}>İptal</Button>
                    <Button type="submit" variant="contained">Kaydet</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}