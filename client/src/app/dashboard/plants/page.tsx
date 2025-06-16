'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { PlantsTable } from '@/components/dashboard/nursery/plants-table';
import { PlantCreateForm } from '@/components/dashboard/nursery/plant-create-form';
import type { Plant } from '@/types/nursery';

export default function Page(): React.JSX.Element {
    const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
    const [plants, setPlants] = React.useState<Plant[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const fetchPlants = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Fidan kimlikleri yüklenemedi.');
            }
            const data = await response.json();
            setPlants(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchPlants();
    }, [fetchPlants]);

    const handleSuccess = () => {
        setCreateModalOpen(false);
        fetchPlants();
    };

    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={3}>
                <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                    <Typography variant="h4">Fidan Kimlikleri</Typography>
                    <Typography variant="body1">
                        Sistemde kayıtlı tüm fidan kombinasyonlarını yönetebilirsiniz.
                    </Typography>
                </Stack>
                <div>
                    <Button
                        startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                        variant="contained"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        Yeni Fidan Kimliği Ekle
                    </Button>
                </div>
            </Stack>

            <PlantCreateForm 
                open={isCreateModalOpen} 
                onClose={() => setCreateModalOpen(false)}
                onSuccess={handleSuccess}
            /> 

            {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : <PlantsTable rows={plants} />}
        </Stack>
    );
}