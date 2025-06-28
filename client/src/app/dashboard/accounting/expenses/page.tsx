'use client';

import * as React from 'react';
import { Button, Stack, Typography, CircularProgress, Alert } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';

import { useUser } from '@/hooks/use-user';
import { ExpensesTable } from '@/components/dashboard/expense/expenses-table';
import { ExpenseCreateForm } from '@/components/dashboard/expense/expense-create-form';
import type { Expense, ExpenseCategory, ProductionBatch } from '@/types/nursery';

export default function Page(): React.JSX.Element {
    const { user: currentUser, isLoading: isUserLoading } = useUser();
    const [expenses, setExpenses] = React.useState<Expense[]>([]);
    const [categories, setCategories] = React.useState<ExpenseCategory[]>([]);
    const [productionBatches, setProductionBatches] = React.useState<ProductionBatch[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);

    const canManageExpenses = currentUser?.roles?.some(
        role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT'
    );
    const canViewExpenses = currentUser?.roles?.some(
        role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT' || role.name === 'SALES'
    );

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Oturum bulunamadı.');
            setLoading(false);
            return;
        }

        try {
            // Expenses, categories, ve production batches'i paralel olarak çekelim
            const [expensesRes, categoriesRes, productionBatchesRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/expenses`, { headers: { 'Authorization': `Bearer ${token}` } }),
                // DÜZELTME: Kategori API yolu /expenses altına alındı
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/expenses/categories`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/production-batches`, { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);

            if (!expensesRes.ok || !categoriesRes.ok || !productionBatchesRes.ok) {
                if (!expensesRes.ok) console.error('Giderler çekilirken hata:', await expensesRes.text());
                // Hata mesajını düzeltelim, artık doğru URL'ye gidiyor
                if (!categoriesRes.ok) console.error('Kategoriler çekilirken hata (URL hatası düzeltildi, backend kontrol edilmeli):', await categoriesRes.text());
                if (!productionBatchesRes.ok) console.error('Üretim Partileri çekilirken hata:', await productionBatchesRes.text());
                throw new Error('Veriler yüklenirken bir hata oluştu.');
            }

            setExpenses(await expensesRes.json());
            setCategories(await categoriesRes.json());
            setProductionBatches(await productionBatchesRes.json());

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (canViewExpenses) {
            fetchData();
        } else if (!isUserLoading) {
            setLoading(false);
            setError('Giderleri görüntüleme yetkiniz bulunmamaktadır.');
        }
    }, [canViewExpenses, fetchData, isUserLoading]);

    const handleCreateSuccess = () => {
        setCreateModalOpen(false);
        fetchData();
    };

    if (isUserLoading) {
        return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
    }

    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={3}>
                <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                    <Typography variant="h4">Giderler</Typography>
                    <Typography variant="body1">
                        İşletmenizin tüm giderlerini burada yönetin.
                    </Typography>
                </Stack>
                <div>
                    {canManageExpenses && (
                        <Button
                            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                            variant="contained"
                            onClick={() => setCreateModalOpen(true)}
                        >
                            Yeni Gider Ekle
                        </Button>
                    )}
                </div>
            </Stack>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            {loading ? (
                <Stack sx={{justifyContent: 'center', alignItems: 'center', minHeight: '300px'}}><CircularProgress /></Stack>
            ) : (
                <ExpensesTable rows={expenses} categories={categories} />
            )}

            <ExpenseCreateForm
                open={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
                categories={categories}
                productionBatches={productionBatches}
            />
        </Stack>
    );
}
