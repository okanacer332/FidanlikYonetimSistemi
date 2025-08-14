// Konum: src/app/dashboard/accounting/suppliers/[supplierId]/page.tsx
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Stack, Typography, CircularProgress, Alert, Button, Chip } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';

// Ortak Bileşenler ve Hook'lar
import { PageHeader } from '@/components/common/PageHeader';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { InlineCreateForm } from '@/components/common/InlineCreateForm';
import { useUser } from '@/hooks/use-user';
import { useApiSWR } from '@/hooks/use-api-swr';
import { useNotifier } from '@/hooks/useNotifier';

// Servis Katmanı ve Tipler
import type { Transaction, Supplier } from '@/types/nursery';
import { TediyeCreateForm } from '@/components/dashboard/accounting/tediye-create-form';

interface TransactionRow extends Transaction {
  balance: number;
}

// SWR Hook'ları
const useSupplier = (id: string | null) => useApiSWR<Supplier>(id ? `/suppliers/${id}` : null);
const useTransactions = (id: string | null) => useApiSWR<Transaction[]>(id ? `/accounting/suppliers/${id}/transactions` : null);

export default function Page(): React.JSX.Element {
  const params = useParams();
  const supplierId = params.supplierId as string | null;

  const { user: currentUser } = useUser();
  const notify = useNotifier();
  const { data: supplier, error: supplierError, isLoading: isLoadingSupplier } = useSupplier(supplierId);
  const { data: transactionsData, error: transactionsError, isLoading: isLoadingTransactions, mutate: mutateTransactions } = useTransactions(supplierId);
  
  const [isCreateFormOpen, setCreateFormOpen] = React.useState(false);
  const [newlyAddedId, setNewlyAddedId] = React.useState<string | null>(null);

  const isLoading = isLoadingSupplier || isLoadingTransactions;
  const error = supplierError || transactionsError;
  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

  const handleSuccess = React.useCallback(async (newTransaction: Transaction) => {
    setCreateFormOpen(false);
    notify.success('Tediye başarıyla kaydedildi.');
    setNewlyAddedId(newTransaction.id);
    await mutateTransactions();
    setTimeout(() => setNewlyAddedId(null), 2000);
  }, [mutateTransactions, notify]);

  const transactionRows = React.useMemo((): TransactionRow[] => {
    const transactions = transactionsData || [];
    let currentBalance = 0;
    const rowsWithBalance: TransactionRow[] = [];

    for (let i = transactions.length - 1; i >= 0; i--) {
      const txn = transactions[i];
      if (txn.type === 'DEBIT') { // Tedarikçiye borç (Mal Alımı)
        currentBalance += txn.amount;
      } else { // Tedarikçiye alacak (Ödeme)
        currentBalance -= txn.amount;
      }
      rowsWithBalance.push({ ...txn, balance: currentBalance });
    }
    return rowsWithBalance.reverse();
  }, [transactionsData]);

  const columns: ColumnDef<TransactionRow>[] = React.useMemo(() => [
    { key: 'transactionDate', header: 'Tarih', render: (row) => dayjs(row.transactionDate).format('DD.MM.YYYY HH:mm') },
    { key: 'description', header: 'Açıklama', render: (row) => row.description },
    { key: 'type', header: 'İşlem Tipi', render: (row) => <Chip label={row.type === 'DEBIT' ? 'Borç' : 'Alacak'} color={row.type === 'DEBIT' ? 'error' : 'success'} size="small" /> },
    { key: 'debit', header: 'Borç', align: 'right', render: (row) => row.type === 'DEBIT' ? row.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '-' },
    { key: 'credit', header: 'Alacak', align: 'right', render: (row) => row.type === 'CREDIT' ? row.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '-' },
    { key: 'balance', header: 'Bakiye', align: 'right', render: (row) => row.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) },
  ], []);

  if (isLoading) return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!canView) return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;

  const currentBalance = transactionRows[0]?.balance ?? 0;

  return (
    <Stack spacing={3}>
      <AppBreadcrumbs />
      <PageHeader
        title={supplier ? `${supplier.name} Ekstresi` : 'Tedarikçi Ekstresi'}
        action={
          <Button startIcon={<PlusIcon />} variant="contained" onClick={() => setCreateFormOpen(prev => !prev)} disabled={!supplier}>
            Tediye Ekle
          </Button>
        }
      />
      <InlineCreateForm
        title="Yeni Tediye (Ödeme) Girişi"
        isOpen={isCreateFormOpen}
        onClose={() => setCreateFormOpen(false)}
      >
        <TediyeCreateForm
          onClose={() => setCreateFormOpen(false)}
          onSuccess={handleSuccess}
          suppliers={supplier ? [supplier] : []}
          preselectedSupplierId={supplierId}
        />
      </InlineCreateForm>
      <Stack direction="row" justifyContent="flex-end">
        <Typography variant="h6">
          Güncel Bakiye: <Typography component="span" variant="h6" color={currentBalance >= 0 ? 'error.main' : 'success.main'} fontWeight="bold">
            {currentBalance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
          </Typography>
        </Typography>
      </Stack>
      <ActionableTable<TransactionRow>
        columns={columns}
        rows={transactionRows}
        count={transactionRows.length}
        page={0}
        rowsPerPage={transactionRows.length || 10}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
        selectionEnabled={false}
        entity="supplier-transactions"
        highlightedId={newlyAddedId}
      />
    </Stack>
  );
}