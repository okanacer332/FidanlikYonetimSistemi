// Konum: src/app/dashboard/accounting/expenses/page.tsx
'use client';

import * as React from 'react';
import { Stack, CircularProgress, Alert, Button } from '@mui/material'; // <-- Stack import'u burada
import { Plus as PlusIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';

// Ortak Bileşenler ve Hook'lar
import { PageHeader } from '@/components/common/PageHeader';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { InlineCreateForm } from '@/components/common/InlineCreateForm';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { useUser } from '@/hooks/use-user';
import { useApiSWR } from '@/hooks/use-api-swr';
import { useNotifier } from '@/hooks/useNotifier';

// Modüle Özel Bileşenler, API ve Tipler
import type { Expense, ExpenseCategory } from '@/types/expense';
import { ExpenseCreateForm } from '@/components/dashboard/expense/expense-create-form';
// 'api/expense' dosyası artık sayfa tarafından değil, SWR hook'u tarafından kullanılacak.

// SWR Hook'ları
const useExpenses = () => useApiSWR<Expense[]>('/expenses');
const useExpenseCategories = () => useApiSWR<ExpenseCategory[]>('/expense-categories');

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const notify = useNotifier();

  // Veri çekme
  const { data: expensesData, error: expensesError, isLoading: isLoadingExpenses, mutate: mutateExpenses } = useExpenses();
  const { data: categoriesData, error: categoriesError, isLoading: isLoadingCategories } = useExpenseCategories();

  // State'ler
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = React.useState<string>('expenseDate');
  const [isCreateFormOpen, setCreateFormOpen] = React.useState(false);
  const [newlyAddedId, setNewlyAddedId] = React.useState<string | null>(null);

  const isLoading = isLoadingExpenses || isLoadingCategories;
  const error = expensesError || categoriesError;
  const canManage = currentUser?.roles?.some(role => ['ADMIN', 'ACCOUNTANT'].includes(role.name));

  const handleSuccess = (newExpense: Expense) => {
    setCreateFormOpen(false);
    setNewlyAddedId(newExpense.id);
    mutateExpenses();
    notify.success('Gider başarıyla kaydedildi.');
    setTimeout(() => setNewlyAddedId(null), 2000);
  };

  const handleRequestSort = React.useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  const sortedAndFilteredExpenses = React.useMemo(() => {
    const expenses = expensesData || [];
    const filtered = searchTerm
      ? expenses.filter(e =>
          e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e.category && e.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : expenses;

    return [...filtered].sort((a, b) => {
      const aValue = (a as any)[orderBy] || '';
      const bValue = (b as any)[orderBy] || '';
      return order === 'asc' ? String(aValue).localeCompare(String(bValue), 'tr') : String(bValue).localeCompare(String(aValue), 'tr');
    });
  }, [expensesData, searchTerm, order, orderBy]);

  const paginatedExpenses = React.useMemo(() => {
    return sortedAndFilteredExpenses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedAndFilteredExpenses, page, rowsPerPage]);

  const columns: ColumnDef<Expense>[] = React.useMemo(() => [
    { key: 'expenseDate', header: 'Tarih', sortable: true, render: (row) => dayjs(row.expenseDate).format('DD.MM.YYYY'), getValue: (row) => row.expenseDate },
    { key: 'category.name', header: 'Kategori', sortable: true, render: (row) => row.category?.name || 'N/A', getValue: (row) => row.category?.name || '' },
    { key: 'description', header: 'Açıklama', sortable: true, render: (row) => row.description, getValue: (row) => row.description },
    { key: 'amount', header: 'Tutar', sortable: true, render: (row) => row.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }), getValue: (row) => row.amount },
  ], []);

  if (isLoading) return <Stack alignItems="center" justifyContent="center" sx={{minHeight: '80vh'}}><CircularProgress /></Stack>;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!canManage) return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;

  return (
    <Stack spacing={3}>
      <AppBreadcrumbs />
      <PageHeader
        title="Gider Yönetimi"
        action={
          <Button startIcon={<PlusIcon />} variant="contained" onClick={() => setCreateFormOpen(prev => !prev)}>
            Yeni Gider Ekle
          </Button>
        }
      />
      
      <InlineCreateForm
        title="Yeni Gider Girişi"
        isOpen={isCreateFormOpen}
        onClose={() => setCreateFormOpen(false)}
      >
        <ExpenseCreateForm
          onSuccess={handleSuccess}
          onCancel={() => setCreateFormOpen(false)}
          categories={categoriesData || []}
        />
      </InlineCreateForm>

      <ActionableTable
        columns={columns}
        rows={paginatedExpenses}
        count={sortedAndFilteredExpenses.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); }}
        searchTerm={searchTerm}
        onSearch={(e) => { setSearchTerm(e.target.value); setPage(0); }}
        selectionEnabled={false}
        highlightedId={newlyAddedId}
        order={order}
        orderBy={orderBy}
        onSort={handleRequestSort}
        entity="expenses"
      />
    </Stack>
  );
}