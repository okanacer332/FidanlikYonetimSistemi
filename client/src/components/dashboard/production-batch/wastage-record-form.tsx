'use client';

import * as React from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, FormHelperText, Typography, Alert,
  Stack
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import type { ProductionBatch } from '@/types/nursery';

interface WastageRecordFormProps {
    open: boolean;
    onClose: (shouldRefresh: boolean) => void;
    batch: ProductionBatch;
}

export function WastageRecordForm({ open, onClose, batch }: WastageRecordFormProps): React.JSX.Element {
    const schema = z.object({
        quantity: z.number()
            .min(1, 'Miktar en az 1 olmalı')
            .max(batch.currentQuantity, `Miktar, mevcut stoktan (${batch.currentQuantity}) fazla olamaz`),
        reason: z.string().min(3, 'Lütfen geçerli bir sebep girin.'),
    });

    type FormValues = z.infer<typeof schema>;

    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { quantity: 1, reason: '' },
    });
    
    const [apiError, setApiError] = React.useState<string | null>(null);

    React.useEffect(() => {
        reset({ quantity: 1, reason: '' });
        setApiError(null);
    }, [open, reset]);

    const onSubmit = async (values: FormValues) => {
        setApiError(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/production-batches/${batch.id}/wastage`, {
                method: 'POST',
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
            <DialogTitle>Zayiat / Fire Bildir</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Alert severity="info">
                            <Typography variant="body2">
                                <b>{batch.batchCode}</b> kodlu partiden zayiat düşüyorsunuz.
                                <br/>
                                <b>Fidan:</b> {batch.plantName}
                                <br/>
                                <b>Mevcut Miktar:</b> {batch.currentQuantity}
                            </Typography>
                        </Alert>
                        <Controller
                            name="quantity"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Zayiat Miktarı"
                                    type="number"
                                    fullWidth
                                    error={!!errors.quantity}
                                    helperText={errors.quantity?.message}
                                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                />
                            )}
                        />
                        <Controller
                            name="reason"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Sebep"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    error={!!errors.reason}
                                    helperText={errors.reason?.message}
                                />
                            )}
                        />
                         {apiError && <FormHelperText error>{apiError}</FormHelperText>}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => onClose(false)}>İptal</Button>
                    <Button type="submit" variant="contained" color="warning">Zayiatı Kaydet</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}