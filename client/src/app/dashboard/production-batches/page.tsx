'use client';

import * as React from 'react';
import { Stack, Typography, Alert, CircularProgress } from '@mui/material';
import { useUser } from '@/hooks/use-user';
import type { ProductionBatch } from '@/types/nursery';
import { ProductionBatchesTable } from '@/components/dashboard/production-batch/production-batches-table';
import { WastageRecordForm } from '@/components/dashboard/production-batch/wastage-record-form';
import { ProductionBatchForm } from '@/components/dashboard/production-batch/production-batch-form'; // Yeni Form

export default function Page(): React.JSX.Element {
    const { user: currentUser } = useUser();
    const [batches, setBatches] = React.useState<ProductionBatch[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Form state'leri
    const [isWastageFormOpen, setWastageFormOpen] = React.useState(false);
    const [isEditFormOpen, setEditFormOpen] = React.useState(false); // Yeni state
    const [selectedBatch, setSelectedBatch] = React.useState<ProductionBatch | null>(null);

    const canManage = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'WAREHOUSE_STAFF');

    const fetchBatches = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/production-batches`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Üretim partileri yüklenemedi.');
            const data: ProductionBatch[] = await response.json();
            setBatches(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (canManage) {
            fetchBatches();
        }
    }, [canManage]);

    const handleRecordWastage = (batch: ProductionBatch) => {
        setSelectedBatch(batch);
        setWastageFormOpen(true);
    };

    const handleEdit = (batch: ProductionBatch) => {
        setSelectedBatch(batch);
        setEditFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu partiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) return;
        
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/production-batches/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                 const errorText = await response.text();
                 throw new Error(`Parti silinemedi: ${errorText}`);
            }
            fetchBatches(); // Listeyi yenile
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };
    
    const handleFormClose = (shouldRefresh: boolean) => {
        setWastageFormOpen(false);
        setEditFormOpen(false);
        setSelectedBatch(null);
        if (shouldRefresh) {
            fetchBatches();
        }
    };

    if (!canManage) return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;
    if (loading) return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;

    return (
        <Stack spacing={3}>
            <Typography variant="h4">Üretim Partileri</Typography>
            {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
            <ProductionBatchesTable 
                rows={batches} 
                onRecordWastage={handleRecordWastage}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            {selectedBatch && (
                <>
                    <WastageRecordForm
                        open={isWastageFormOpen}
                        onClose={handleFormClose}
                        batch={selectedBatch}
                    />
                    <ProductionBatchForm
                        open={isEditFormOpen}
                        onClose={handleFormClose}
                        batch={selectedBatch}
                    />
                </>
            )}
        </Stack>
    );
}