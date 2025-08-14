// Konum: src/app/dashboard/definitions/expense-categories/page.tsx
'use client';

import * as React from 'react';
import {
  Stack, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, 
  DialogContentText, DialogActions, IconButton, Tooltip, Grid, TextField
} from '@mui/material';
import { Plus as PlusIcon, Pencil as PencilIcon, Trash as TrashIcon } from '@phosphor-icons/react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

// Ortak Bileşenler ve Hook'lar
import { PageHeader } from '@/components/common/PageHeader';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { InlineCreateForm } from '@/components/common/InlineCreateForm';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { useUser } from '@/hooks/use-user';
import { useApiSWR } from '@/hooks/use-api-swr';
import { useNotifier } from '@/hooks/useNotifier';

// Modüle Özel Bileşenler, API ve Tipler
import type { ExpenseCategory } from '@/types/expense';
import { createExpenseCategory, deleteExpenseCategory } from '@/api/expense';
import { ExpenseCategoryEditForm } from '@/components/dashboard/expense/expense-category-edit-form';

// SWR Hook'u
const useExpenseCategories = () => useApiSWR<ExpenseCategory[]>('/expense-categories');

// Yeni kategori oluşturma formu için şema ve tip
const createSchema = zod.object({
  name: zod.string().min(2, 'Kategori adı en az 2 karakter olmalıdır.'),
  description: zod.string().optional(),
});
type CreateFormValues = zod.infer<typeof createSchema>;

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const notify = useNotifier();
  const { data: categories, error, isLoading, mutate } = useExpenseCategories();

  // State'ler
  const [isCreateFormOpen, setCreateFormOpen] = React.useState(false);
  const [categoryToEdit, setCategoryToEdit] = React.useState<ExpenseCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = React.useState<ExpenseCategory | null>(null);
  const [newlyAddedId, setNewlyAddedId] = React.useState<string | null>(null);

  // create form için react-hook-form
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', description: '' },
  });
  
  const canManage = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

  const handleCreateSubmit = React.useCallback(async (values: CreateFormValues) => {
    try {
      const newCategory = await createExpenseCategory(values);
      setNewlyAddedId(newCategory.id);
      notify.success('Kategori başarıyla oluşturuldu.');
      reset();
      setCreateFormOpen(false);
      await mutate(); // Listeyi SWR ile yenile
      setTimeout(() => setNewlyAddedId(null), 2000);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Bir hata oluştu.');
    }
  }, [mutate, notify, reset]);

  const handleEditSuccess = () => {
    setCategoryToEdit(null);
    notify.success('Kategori başarıyla güncellendi.');
    mutate();
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteExpenseCategory(categoryToDelete.id);
      notify.success('Kategori başarıyla silindi.');
      mutate();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Silme işlemi başarısız oldu.');
    } finally {
      setCategoryToDelete(null);
    }
  };

  const columns: ColumnDef<ExpenseCategory>[] = React.useMemo(() => [
    { key: 'name', header: 'Kategori Adı', sortable: true, getValue: (row) => row.name, render: (row) => row.name },
    { key: 'description', header: 'Açıklama', sortable: false, render: (row) => row.description || '-' },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (row) => (
        <Stack direction="row">
          <Tooltip title="Düzenle"><IconButton size="small" onClick={() => setCategoryToEdit(row)}><PencilIcon /></IconButton></Tooltip>
          <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => setCategoryToDelete(row)}><TrashIcon /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ], []);

  if (isLoading) return <Stack alignItems="center" justifyContent="center" sx={{minHeight: '80vh'}}><CircularProgress /></Stack>;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!canManage) return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;

  return (
    <Stack spacing={3}>
      <AppBreadcrumbs />
      <PageHeader
        title="Gider Kategorileri"
        action={
          <Button startIcon={<PlusIcon />} variant="contained" onClick={() => setCreateFormOpen(p => !p)}>
            Yeni Kategori Ekle
          </Button>
        }
      />
      
      <InlineCreateForm
        title="Yeni Gider Kategorisi Oluştur"
        isOpen={isCreateFormOpen}
        onClose={() => setCreateFormOpen(false)}
      >
        <form onSubmit={handleSubmit(handleCreateSubmit)}>
            <Grid container spacing={2} sx={{p: 2}}>
                <Grid size={{xs: 12, md: 5}}>
                    <Controller name="name" control={control} render={({ field }) => ( <TextField {...field} label="Kategori Adı" fullWidth required size="small" error={!!errors.name} helperText={errors.name?.message} /> )}/>
                </Grid>
                <Grid size={{xs: 12, md: 5}}>
                    <Controller name="description" control={control} render={({ field }) => ( <TextField {...field} label="Açıklama (Opsiyonel)" fullWidth size="small" /> )}/>
                </Grid>
                <Grid size={{xs: 12, md: 2}} sx={{display: 'flex', alignItems: 'center'}}>
                    <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth>
                        {isSubmitting ? <CircularProgress size={24} /> : 'Kaydet'}
                    </Button>
                </Grid>
            </Grid>
        </form>
      </InlineCreateForm>
      
      <ActionableTable
        columns={columns}
        rows={categories || []}
        count={categories?.length || 0}
        page={0}
        rowsPerPage={categories?.length || 10}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
        selectionEnabled={false}
        highlightedId={newlyAddedId}
        entity="expense-categories"
      />

      <ExpenseCategoryEditForm
        open={!!categoryToEdit}
        onClose={() => setCategoryToEdit(null)}
        onSuccess={handleEditSuccess}
        category={categoryToEdit}
      />

      <Dialog open={!!categoryToDelete} onClose={() => setCategoryToDelete(null)}>
        <DialogTitle>Kategoriyi Sil</DialogTitle>
        <DialogContent><DialogContentText>Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryToDelete(null)}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error">Sil</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}