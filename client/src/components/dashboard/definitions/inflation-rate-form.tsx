'use client';

import * as React from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem, FormControl, InputLabel, Grid, FormHelperText
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { InflationRate } from '@/types/nursery';
import dayjs from 'dayjs';

const schema = z.object({
    year: z.number().min(2000, 'Geçerli bir yıl girin').max(2100, 'Geçerli bir yıl girin'),
    month: z.number().min(1, 'Ay seçin').max(12, 'Ay seçin'),
    rate: z.number().min(0, 'Oran negatif olamaz'),
});

type FormValues = z.infer<typeof schema>;

interface InflationRateFormProps {
    open: boolean;
    onClose: (shouldRefresh: boolean) => void;
    editingRate: InflationRate | null;
}

export function InflationRateForm({ open, onClose, editingRate }: InflationRateFormProps): React.JSX.Element {
    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { year: dayjs().year(), month: dayjs().month() + 1, rate: 0 },
    });
    const [apiError, setApiError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (editingRate) {
            reset({
                year: editingRate.year,
                month: editingRate.month,
                rate: editingRate.rate,
            });
        } else {
            reset({ year: dayjs().year(), month: dayjs().month() + 1, rate: 0 });
        }
        setApiError(null);
    }, [editingRate, open, reset]);

    const onSubmit = async (values: FormValues) => {
        setApiError(null);
        try {
            const token = localStorage.getItem('authToken');
            const url = editingRate
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/inflation-rates/${editingRate.id}`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/inflation-rates`;
            const method = editingRate ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
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

    const monthNames = React.useMemo(() => Array.from({ length: 12 }, (_, i) => dayjs().month(i).format('MMMM')), []);

    return (
        <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
            <DialogTitle>{editingRate ? 'Oranı Düzenle' : 'Yeni Enflasyon Oranı Ekle'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {/* --- KULLANIMINIZLA BİREBİR AYNI OLACAK ŞEKİLDE DÜZELTİLDİ --- */}
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="year"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Yıl"
                                        type="number"
                                        fullWidth
                                        error={!!errors.year}
                                        helperText={errors.year?.message}
                                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth error={!!errors.month}>
                                <InputLabel>Ay</InputLabel>
                                <Controller
                                    name="month"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field} label="Ay">
                                            {monthNames.map((name, index) => (
                                                <MenuItem key={index} value={index + 1}>{name}</MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.month && <FormHelperText>{errors.month.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                             <Controller
                                name="rate"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Enflasyon Oranı (%)"
                                        type="number"
                                        fullWidth
                                        inputProps={{ step: "0.01" }}
                                        error={!!errors.rate}
                                        helperText={errors.rate?.message}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                    {/* --- DÜZELTME SONU --- */}
                    {apiError && <FormHelperText error sx={{mt: 2}}>{apiError}</FormHelperText>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => onClose(false)}>İptal</Button>
                    <Button type="submit" variant="contained">Kaydet</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}