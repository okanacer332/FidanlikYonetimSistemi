'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import {
  Stack,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import { Pencil as PencilIcon, Trash as TrashIcon } from '@phosphor-icons/react';

// Ortak Bileşenler ve Hook'lar
import { PageHeader } from '@/components/common/PageHeader';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { InlineCreateForm } from '@/components/common/InlineCreateForm';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { ControlledFormField } from '@/components/common/ControlledFormField';
import { useNotifier } from '@/hooks/useNotifier';
import { useUser } from '@/hooks/use-user';

// Yeni Servis Katmanımız
import { useSuppliers, createSupplier, deleteSupplier } from '@/services/supplierService';

// Tipler ve Diğer Bileşenler
import type { Supplier, SupplierCreate } from '@/types/nursery';
import { SupplierEditForm } from '@/components/dashboard/supplier/supplier-edit-form';

// Form şeması
const schema = zod.object({
  name: zod.string().min(2, 'Tedarikçi adı en az 2 karakter olmalıdır.'),
  contactPerson: zod.string().min(2, 'Yetkili kişi en az 2 karakter olmalıdır.'),
  phone: zod.string().min(10, 'Geçerli bir telefon numarası giriniz.'),
  email: zod.string().email('Geçerli bir e-posta adresi girin.').optional().or(zod.literal('')),
  address: zod.string().min(5, 'Adres en az 5 karakter olmalıdır.'),
});

type FormValues = zod.infer<typeof schema>;

export default function Page(): React.JSX.Element {
  const notify = useNotifier();
  const { user: currentUser } = useUser();
  
  const { data: suppliersData, error, isLoading, mutate: mutateSuppliers } = useSuppliers();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isCreateFormOpen, setCreateFormOpen] = React.useState(false);
  
  const [isEditModalOpen, setEditModalOpen] = React.useState(false);
  const [supplierToEdit, setSupplierToEdit] = React.useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = React.useState<Supplier | null>(null);
  
  const [isTableLoading, setIsTableLoading] = React.useState(false);
  const [newlyAddedId, setNewlyAddedId] = React.useState<string | null>(null);

  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = React.useState<string>('name');

  const { control, handleSubmit, reset, setError: setFormError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', contactPerson: '', phone: '', email: '', address: '' },
  });

  const canManage = currentUser?.roles?.some(role => ['ADMIN', 'WAREHOUSE_STAFF'].includes(role.name));

  const handleRequestSort = React.useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  const handleCreateSubmit = React.useCallback(async (values: FormValues) => {
    try {
      const newSupplier = await createSupplier(values);
      reset();
      setCreateFormOpen(false);
      setNewlyAddedId(newSupplier.id);
      await mutateSuppliers();
      notify.success('Tedarikçi başarıyla oluşturuldu.');
      setTimeout(() => setNewlyAddedId(null), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu.';
      notify.error(errorMessage);
      setFormError('root', { type: 'server', message: errorMessage });
    }
  }, [mutateSuppliers, reset, setFormError, notify]);

  const handleEditClick = React.useCallback((supplier: Supplier) => {
    setSupplierToEdit(supplier);
    setEditModalOpen(true);
  }, []);

  const handleEditSuccess = React.useCallback(async () => {
    setEditModalOpen(false);
    await mutateSuppliers();
    notify.success('Tedarikçi başarıyla güncellendi.');
  }, [mutateSuppliers, notify]);

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!supplierToDelete) return;
    setIsTableLoading(true);
    try {
      await deleteSupplier(supplierToDelete.id);
      setSupplierToDelete(null);
      await mutateSuppliers();
      notify.success('Tedarikçi başarıyla silindi.');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Silme işlemi başarısız oldu.');
    } finally {
      setIsTableLoading(false);
    }
  }, [supplierToDelete, mutateSuppliers, notify]);

  const sortedAndFilteredSuppliers = React.useMemo(() => {
    const suppliers = suppliersData || [];
    const filtered = searchTerm
      ? suppliers.filter(s => 
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : suppliers;

    return [...filtered].sort((a, b) => {
      const aValue = (a as any)[orderBy] || '';
      const bValue = (b as any)[orderBy] || '';
      if (order === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      }
      return String(bValue).localeCompare(String(aValue));
    });
  }, [suppliersData, searchTerm, order, orderBy]);

  const paginatedSuppliers = React.useMemo(() => {
    return sortedAndFilteredSuppliers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedAndFilteredSuppliers, page, rowsPerPage]);

  const columns: ColumnDef<Supplier>[] = React.useMemo(() => [
    { key: 'name', header: 'Tedarikçi Adı', sortable: true, render: (row) => row.name, getValue: (row) => row.name },
    { key: 'contactPerson', header: 'Yetkili Kişi', sortable: true, render: (row) => row.contactPerson, getValue: (row) => row.contactPerson },
    { key: 'phone', header: 'Telefon', sortable: false, render: (row) => row.phone, getValue: (row) => row.phone },
    { key: 'email', header: 'E-posta', sortable: true, render: (row) => row.email || '-', getValue: (row) => row.email || '' },
    {
      key: 'actions',
      header: 'İşlemler',
      sortable: false,
      render: (row) => (
        <Stack direction="row">
          {canManage && <Tooltip title="Düzenle"><IconButton size="small" onClick={() => handleEditClick(row)}><PencilIcon /></IconButton></Tooltip>}
          {canManage && <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => setSupplierToDelete(row)}><TrashIcon /></IconButton></Tooltip>}
        </Stack>
      ),
    },
  ], [canManage, handleEditClick]);

  if (isLoading) return <Stack alignItems="center" justifyContent="center" sx={{minHeight: '80vh'}}><CircularProgress /></Stack>;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!canManage) return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;

  return (
    <Stack spacing={3}>
      <AppBreadcrumbs />
      <PageHeader
        title="Tedarikçi Yönetimi"
        action={ <Button variant="contained" onClick={() => setCreateFormOpen(prev => !prev)}>Yeni Tedarikçi Ekle</Button> }
      />
      <InlineCreateForm
        title="Yeni Tedarikçi Oluştur"
        isOpen={isCreateFormOpen}
        onClose={() => setCreateFormOpen(false)}
      >
        <form onSubmit={handleSubmit(handleCreateSubmit)}>
          <Stack spacing={2} sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}><ControlledFormField control={control} name="name" label="Tedarikçi Adı" required size="small" /></Grid>
              <Grid size={{ xs: 12, md: 4 }}><ControlledFormField control={control} name="contactPerson" label="Yetkili Kişi" required size="small" /></Grid>
              <Grid size={{ xs: 12, md: 4 }}><ControlledFormField control={control} name="phone" label="Telefon" required size="small" /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><ControlledFormField control={control} name="email" label="E-posta (Opsiyonel)" size="small" /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><ControlledFormField control={control} name="address" label="Adres" required size="small" /></Grid>
            </Grid>
            {errors.root && (<Alert severity="error" sx={{mt: 2}}>{errors.root.message}</Alert>)}
            <Stack direction="row" justifyContent="flex-end">
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : 'Tedarikçiyi Kaydet'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </InlineCreateForm>
      
      <ActionableTable
        columns={columns}
        rows={paginatedSuppliers}
        count={sortedAndFilteredSuppliers.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); }}
        searchTerm={searchTerm}
        onSearch={(e) => { setSearchTerm(e.target.value); setPage(0); }}
        selectionEnabled={false}
        isLoading={isTableLoading}
        highlightedId={newlyAddedId}
        order={order}
        orderBy={orderBy}
        onSort={handleRequestSort}
        entity="suppliers"
      />
      
      <Dialog open={!!supplierToDelete} onClose={() => setSupplierToDelete(null)}>
        <DialogTitle>Tedarikçiyi Sil</DialogTitle>
        <DialogContent><DialogContentText>Bu tedarikçiyi kalıcı olarak silmek istediğinizden emin misiniz?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setSupplierToDelete(null)}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error">Sil</Button>
        </DialogActions>
      </Dialog>
      
      <SupplierEditForm 
        open={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        onSuccess={handleEditSuccess} 
        supplier={supplierToEdit} 
      />
    </Stack>
  );
}