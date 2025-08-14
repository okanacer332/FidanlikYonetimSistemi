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
import { useApiSWR } from '@/hooks/use-api-swr';

// Servis Katmanı
import { useCustomers, createCustomer, deleteCustomer } from '@/services/customerService';

// Tipler ve Diğer Bileşenler
import type { Customer, CustomerCreate } from '@/types/nursery';
import { CustomerEditForm } from '@/components/dashboard/customer/customer-edit-form';

// Form şeması
const schema = zod.object({
  firstName: zod.string().min(2, 'Ad en az 2 karakter olmalıdır.'),
  lastName: zod.string().min(2, 'Soyad en az 2 karakter olmalıdır.'),
  companyName: zod.string().optional(),
  phone: zod.string().min(10, 'Geçerli bir telefon numarası giriniz.'),
  email: zod.string().email('Geçerli bir e-posta adresi girin.'),
  address: zod.string().min(5, 'Adres en az 5 karakter olmalıdır.'),
});

type FormValues = zod.infer<typeof schema>;

export default function Page(): React.JSX.Element {
  const notify = useNotifier();
  const { user: currentUser } = useUser();
  
  const { data: customersData, error, isLoading, mutate: mutateCustomers } = useCustomers();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isCreateFormOpen, setCreateFormOpen] = React.useState(false);
  
  const [isEditModalOpen, setEditModalOpen] = React.useState(false);
  const [customerToEdit, setCustomerToEdit] = React.useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = React.useState<Customer | null>(null);
  
  const [isTableLoading, setIsTableLoading] = React.useState(false);
  const [newlyAddedId, setNewlyAddedId] = React.useState<string | null>(null);

  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = React.useState<string>('firstName');

  const { control, handleSubmit, reset, setError: setFormError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', companyName: '', phone: '', email: '', address: '' },
  });

  const canManage = currentUser?.roles?.some(role => ['ADMIN', 'SALES'].includes(role.name));

  const handleRequestSort = React.useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  const handleCreateSubmit = React.useCallback(async (values: FormValues) => {
    try {
      const newCustomer = await createCustomer(values);
      reset();
      setCreateFormOpen(false);
      setNewlyAddedId(newCustomer.id);
      await mutateCustomers();
      notify.success('Müşteri başarıyla oluşturuldu.');
      setTimeout(() => setNewlyAddedId(null), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu.';
      notify.error(errorMessage);
      setFormError('root', { type: 'server', message: errorMessage });
    }
  }, [mutateCustomers, reset, setFormError, notify]);

  const handleEditClick = React.useCallback((customer: Customer) => {
    setCustomerToEdit(customer);
    setEditModalOpen(true);
  }, []);

  const handleEditSuccess = React.useCallback(async () => {
    setEditModalOpen(false);
    await mutateCustomers();
    notify.success('Müşteri başarıyla güncellendi.');
  }, [mutateCustomers, notify]);

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!customerToDelete) return;
    setIsTableLoading(true);
    try {
      await deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
      await mutateCustomers();
      notify.success('Müşteri başarıyla silindi.');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Silme işlemi başarısız oldu.');
    } finally {
      setIsTableLoading(false);
    }
  }, [customerToDelete, mutateCustomers, notify]);

  const sortedAndFilteredCustomers = React.useMemo(() => {
    const customers = customersData || [];
    const filtered = searchTerm
      ? customers.filter(c => 
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : customers;

    return [...filtered].sort((a, b) => {
      const aValue = (a as any)[orderBy] || '';
      const bValue = (b as any)[orderBy] || '';
      if (order === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      }
      return String(bValue).localeCompare(String(aValue));
    });
  }, [customersData, searchTerm, order, orderBy]);

  const paginatedCustomers = React.useMemo(() => {
    return sortedAndFilteredCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedAndFilteredCustomers, page, rowsPerPage]);

  const columns: ColumnDef<Customer>[] = React.useMemo(() => [
    { key: 'firstName', header: 'Adı Soyadı', sortable: true, render: (row) => `${row.firstName} ${row.lastName}`, getValue: (row) => `${row.firstName} ${row.lastName}` },
    { key: 'companyName', header: 'Firma Adı', sortable: true, render: (row) => row.companyName || '-', getValue: (row) => row.companyName || '' },
    { key: 'phone', header: 'Telefon', sortable: false, render: (row) => row.phone, getValue: (row) => row.phone },
    { key: 'email', header: 'E-posta', sortable: true, render: (row) => row.email, getValue: (row) => row.email },
    {
      key: 'actions',
      header: 'İşlemler',
      sortable: false,
      render: (row) => (
        <Stack direction="row">
          {canManage && <Tooltip title="Düzenle"><IconButton size="small" onClick={() => handleEditClick(row)}><PencilIcon /></IconButton></Tooltip>}
          {canManage && <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => setCustomerToDelete(row)}><TrashIcon /></IconButton></Tooltip>}
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
        title="Müşteri Yönetimi"
        action={ <Button variant="contained" onClick={() => setCreateFormOpen(prev => !prev)}>Yeni Müşteri Ekle</Button> }
      />
      <InlineCreateForm
        title="Yeni Müşteri Oluştur"
        isOpen={isCreateFormOpen}
        onClose={() => setCreateFormOpen(false)}
      >
        <form onSubmit={handleSubmit(handleCreateSubmit)}>
          <Stack spacing={2} sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}><ControlledFormField control={control} name="firstName" label="Adı" required size="small" /></Grid>
              <Grid size={{ xs: 12, md: 4 }}><ControlledFormField control={control} name="lastName" label="Soyadı" required size="small" /></Grid>
              <Grid size={{ xs: 12, md: 4 }}><ControlledFormField control={control} name="companyName" label="Firma Adı" size="small" /></Grid>
              <Grid size={{ xs: 12, md: 4 }}><ControlledFormField control={control} name="phone" label="Telefon" required size="small" /></Grid>
              <Grid size={{ xs: 12, md: 4 }}><ControlledFormField control={control} name="email" label="E-posta" required size="small" /></Grid>
              <Grid size={{ xs: 12, md: 4 }}><ControlledFormField control={control} name="address" label="Adres" required size="small" /></Grid>
            </Grid>
            {errors.root && (<Alert severity="error" sx={{mt: 2}}>{errors.root.message}</Alert>)}
            <Stack direction="row" justifyContent="flex-end">
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : 'Müşteriyi Kaydet'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </InlineCreateForm>
      
      <ActionableTable
        columns={columns}
        rows={paginatedCustomers}
        count={sortedAndFilteredCustomers.length}
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
        entity="customers"
      />
      
      <Dialog open={!!customerToDelete} onClose={() => setCustomerToDelete(null)}>
        <DialogTitle>Müşteriyi Sil</DialogTitle>
        <DialogContent><DialogContentText>Bu müşteriyi kalıcı olarak silmek istediğinizden emin misiniz?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerToDelete(null)}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error">Sil</Button>
        </DialogActions>
      </Dialog>
      
      <CustomerEditForm 
        open={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        onSuccess={handleEditSuccess} 
        customer={customerToEdit} 
      />
    </Stack>
  );
}