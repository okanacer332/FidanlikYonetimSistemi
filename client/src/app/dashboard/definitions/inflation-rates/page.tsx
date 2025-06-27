'use client';

import * as React from 'react';
import { Button, Stack, Typography, Alert, CircularProgress } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import { useUser } from '@/hooks/use-user';
import type { InflationRate } from '@/types/nursery';
import { InflationRatesTable } from '@/components/dashboard/definitions/inflation-rates-table';
import { InflationRateForm } from '@/components/dashboard/definitions/inflation-rate-form';

export default function Page(): React.JSX.Element {
    const { user: currentUser } = useUser();
    const [rates, setRates] = React.useState<InflationRate[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingRate, setEditingRate] = React.useState<InflationRate | null>(null);

    const canManage = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

    const fetchRates = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inflation-rates`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Enflasyon oranları yüklenemedi.');
            
            // --- DÜZELTİLEN KISIM ---
            // data değişkenine açıkça InflationRate[] türü atandı.
            const data: InflationRate[] = await response.json();
            // --- BİTİŞ ---

            // Verileri yıl ve aya göre sıralayalım
            data.sort((a, b) => b.year - a.year || b.month - a.month);
            setRates(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (canManage) {
            fetchRates();
        }
    }, [canManage]);

    const handleEdit = (rate: InflationRate) => {
        setEditingRate(rate);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu oranı silmek istediğinizden emin misiniz?')) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inflation-rates/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Oran silinemedi.');
            fetchRates(); // Listeyi yenile
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    const handleFormClose = (shouldRefresh: boolean) => {
        setIsFormOpen(false);
        setEditingRate(null);
        if (shouldRefresh) {
            fetchRates();
        }
    };

    if (!canManage) {
        return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;
    }
    
    if (loading) {
        return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>
    }

    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={3} justifyContent="space-between">
                <Typography variant="h4">Enflasyon Oranları</Typography>
                <div>
                    <Button
                        startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                        variant="contained"
                        onClick={() => {
                            setEditingRate(null);
                            setIsFormOpen(true);
                        }}
                    >
                        Yeni Oran Ekle
                    </Button>
                </div>
            </Stack>
            <InflationRatesTable rows={rates} onEdit={handleEdit} onDelete={handleDelete} />
            <InflationRateForm
                open={isFormOpen}
                onClose={handleFormClose}
                editingRate={editingRate}
            />
        </Stack>
    );
}