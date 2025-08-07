// Konum: src/app/dashboard/accounting/current-accounts/[customerId]/page.tsx
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
import { useNotifier } from '@/hooks/useNotifier'; // <-- Notifier'ı import et

// Servis Katmanı ve Tipler
import type { Transaction, Customer } from '@/types/nursery';
import { CollectionCreateForm } from '@/components/dashboard/accounting/collection-create-form';

interface TransactionRow extends Transaction {
  balance: number;
}

const useCustomer = (id: string | null) => useApiSWR<Customer>(id ? `/customers/${id}` : null);
const useTransactions = (id: string | null) => useApiSWR<Transaction[]>(id ? `/accounting/customers/${id}/transactions` : null);

export default function Page(): React.JSX.Element {
  const params = useParams();
  const customerId = params.customerId as string | null;

  const { user: currentUser } = useUser();
  const notify = useNotifier(); // <-- Notifier'ı kullan
  const { data: customer, error: customerError, isLoading: isLoadingCustomer } = useCustomer(customerId);
  const { data: transactionsData, error: transactionsError, isLoading: isLoadingTransactions, mutate: mutateTransactions } = useTransactions(customerId);

  const [isCreateFormOpen, setCreateFormOpen] = React.useState(false);
  // <-- YENİ STATE: Vurgulanacak satırın ID'sini tutar
  const [newlyAddedId, setNewlyAddedId] = React.useState<string | null>(null);

  const isLoading = isLoadingCustomer || isLoadingTransactions;
  const error = customerError || transactionsError;
  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

  // <-- GÜNCELLEME: handleSuccess artık yeni işlemi parametre olarak alıyor
  const handleSuccess = React.useCallback(async (newTransaction: Transaction) => {
    setCreateFormOpen(false);
    notify.success('Tahsilat başarıyla kaydedildi.');
    
    // Veriyi yenilemeden önce yeni eklenen ID'yi state'e al
    setNewlyAddedId(newTransaction.id);
    await mutateTransactions();

    // Birkaç saniye sonra vurguyu kaldır
    setTimeout(() => {
      setNewlyAddedId(null);
    }, 2000); // 2 saniye
  }, [mutateTransactions, notify]);

  const transactionRows = React.useMemo((): TransactionRow[] => {
    // ... bakiye hesaplama mantığı aynı ...
    const transactions = transactionsData || [];
    let currentBalance = 0;
    const rowsWithBalance: TransactionRow[] = [];
    for (let i = transactions.length - 1; i >= 0; i--) {
      const txn = transactions[i];
      if (txn.type === 'DEBIT') {
        currentBalance += txn.amount;
      } else {
        currentBalance -= txn.amount;
      }
      rowsWithBalance.push({ ...txn, balance: currentBalance });
    }
    return rowsWithBalance.reverse();
  }, [transactionsData]);

  const columns: ColumnDef<TransactionRow>[] = React.useMemo(() => [
    // ... sütunlar aynı ...
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
        title={customer ? `${customer.firstName} ${customer.lastName} Ekstresi` : 'Müşteri Ekstresi'}
        action={
          <Button startIcon={<PlusIcon />} variant="contained" onClick={() => setCreateFormOpen(prev => !prev)} disabled={!customer}>
            Tahsilat Ekle
          </Button>
        }
      />
      <InlineCreateForm
        title="Yeni Tahsilat Girişi"
        isOpen={isCreateFormOpen}
        onClose={() => setCreateFormOpen(false)}
      >
        <CollectionCreateForm
          onClose={() => setCreateFormOpen(false)}
          onSuccess={handleSuccess}
          customers={customer ? [customer] : []}
          preselectedCustomerId={customerId}
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
          entity="customer-transactions"
          // <-- YENİ PROP: Vurgulanacak satırın ID'sini tabloya iletiyoruz
          highlightedId={newlyAddedId}
      />
    </Stack>
  );
}