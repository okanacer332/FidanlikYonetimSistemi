'use client';

import * as React from 'react';
import {
  Button, Stack, Typography, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Box,
} from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';

import { useUser } from '@/hooks/use-user';
import type { InflationRate } from '@/types/nursery'; // Daha önce tanımladığımız interface
import { InflationRateForm } from '@/components/dashboard/accounting/inflation-rates/inflation-rate-form'; // Birazdan oluşturacağız
import { InflationRatesTable } from '@/components/dashboard/accounting/inflation-rates/inflation-rates-table'; 

export default function Page(): React.JSX.Element {
    const { user: currentUser, isLoading: isUserLoading } = useUser();
    const [inflationRates, setInflationRates] = React.useState<InflationRate[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [pageError, setPageError] = React.useState<string | null>(null);

    const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
    const [selectedRateToEdit, setSelectedRateToEdit] = React.useState<InflationRate | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false);
    const [rateToDeleteId, setRateToDeleteId] = React.useState<string | null>(null);
    const [deleteError, setDeleteError] = React.useState<string | null>(null);

    // Sadece ADMIN ve ACCOUNTANT rollerinin bu sayfayı görmesine izin verelim
    const canManageInflationRates = currentUser?.roles?.some(
        role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT'
    );

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        setPageError(null);
        if (!canManageInflationRates) {
            setPageError('Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.');
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            setPageError('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inflation-rates`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Enflasyon oranları yüklenemedi.');
            }
            setInflationRates(await response.json());
        } catch (err: any) {
            setPageError(err.message);
        } finally {
            setLoading(false);
        }
    }, [canManageInflationRates]);

    React.useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser, fetchData]);

    const handleFormSuccess = () => {
        setIsFormModalOpen(false);
        setSelectedRateToEdit(null);
        fetchData(); // Verileri yeniden çek
    };

    const handleEditClick = (rate: InflationRate) => {
        setSelectedRateToEdit(rate);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (rateId: string) => {
        setRateToDeleteId(rateId);
        setIsConfirmDeleteOpen(true);
        setDeleteError(null);
    };

    const handleConfirmDelete = async () => {
        if (!rateToDeleteId) return;

        setDeleteError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inflation-rates/${rateToDeleteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Enflasyon oranı silinemedi.');
            }
            setIsConfirmDeleteOpen(false);
            setRateToDeleteId(null);
            fetchData();
        } catch (err: any) {
            setDeleteError(err.message);
        }
    };

    if (isUserLoading) {
        return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
    }

    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={3} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4">Enflasyon Oranları Yönetimi</Typography>
                <div>
                    {canManageInflationRates && (
                        <Button
                            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                            variant="contained"
                            onClick={() => {
                                setSelectedRateToEdit(null); // Yeni kayıt için formu sıfırla
                                setIsFormModalOpen(true);
                            }}
                        >
                            Yeni Oran Ekle
                        </Button>
                    )}
                </div>
            </Stack>

            {pageError && <Alert severity="error">{pageError}</Alert>}

            {loading ? (
                <Stack sx={{ justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}><CircularProgress /></Stack>
            ) : canManageInflationRates ? (
                <InflationRatesTable
                    rows={inflationRates}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                />
            ) : null}
            
            <InflationRateForm
                open={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSuccess={handleFormSuccess}
                inflationRate={selectedRateToEdit}
            />

            <Dialog open={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)}>
                <DialogTitle>Enflasyon Oranını Sil</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bu enflasyon oranını kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem, geçmiş raporlamaları etkileyebilir.
                    </DialogContentText>
                    {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsConfirmDeleteOpen(false)}>İptal</Button>
                    <Button onClick={handleConfirmDelete} color="error">Sil</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}