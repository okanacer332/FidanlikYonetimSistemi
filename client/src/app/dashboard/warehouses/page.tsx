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
import { createWarehouse, deleteWarehouse } from '@/services/warehouseService';

// Tipler ve Diğer Bileşenler
import type { Warehouse, WarehouseCreate } from '@/types/nursery';
import { WarehouseEditForm } from '@/components/dashboard/warehouse/warehouse-edit-form';

// Form şeması
const schema = zod.object({
  name: zod.string().min(2, 'Depo adı en az 2 karakter olmalıdır.'),
  address: zod.string().min(5, 'Adres en az 5 karakter olmalıdır.'),
});

type FormValues = zod.infer<typeof schema>;

const useWarehouses = () => useApiSWR<Warehouse[]>('/warehouses');

export default function Page(): React.JSX.Element {
  const notify = useNotifier();
  const { user: currentUser } = useUser();
  
  const { data: warehousesData, error, isLoading, mutate: mutateWarehouses } = useWarehouses();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isCreateFormOpen, setCreateFormOpen] = React.useState(false);
  
  const [isEditModalOpen, setEditModalOpen] = React.useState(false);
  const [warehouseToEdit, setWarehouseToEdit] = React.useState<Warehouse | null>(null);
  const [warehouseToDelete, setWarehouseToDelete] = React.useState<Warehouse | null>(null);
  
  const [isTableLoading, setIsTableLoading] = React.useState(false);
  const [newlyAddedId, setNewlyAddedId] = React.useState<string | null>(null);

  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = React.useState<string>('name');

  const { control, handleSubmit, reset, setError: setFormError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', address: '' },
  });

  const canManage = currentUser?.roles?.some(role => ['ADMIN', 'WAREHOUSE_STAFF'].includes(role.name));

  const handleRequestSort = React.useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  const handleCreateSubmit = React.useCallback(async (values: FormValues) => {
    try {
      const newWarehouse = await createWarehouse(values);
      reset();
      setCreateFormOpen(false);
      setNewlyAddedId(newWarehouse.id);
      await mutateWarehouses();
      notify.success('Depo başarıyla oluşturuldu.');
      setTimeout(() => setNewlyAddedId(null), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu.';
      notify.error(errorMessage);
      setFormError('root', { type: 'server', message: errorMessage });
    }
  }, [mutateWarehouses, reset, setFormError, notify]);

  const handleEditClick = React.useCallback((warehouse: Warehouse) => {
    setWarehouseToEdit(warehouse);
    setEditModalOpen(true);
  }, []);

  const handleEditSuccess = React.useCallback(async () => {
    setEditModalOpen(false);
    await mutateWarehouses();
    notify.success('Depo başarıyla güncellendi.');
  }, [mutateWarehouses, notify]);

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!warehouseToDelete) return;
    setIsTableLoading(true);
    try {
      await deleteWarehouse(warehouseToDelete.id);
      setWarehouseToDelete(null);
      await mutateWarehouses();
      notify.success('Depo başarıyla silindi.');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Silme işlemi başarısız oldu.');
    } finally {
      setIsTableLoading(false);
    }
  }, [warehouseToDelete, mutateWarehouses, notify]);

  const sortedAndFilteredWarehouses = React.useMemo(() => {
    const warehouses = warehousesData || [];
    const filtered = searchTerm
      ? warehouses.filter(w => 
          w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          w.address.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : warehouses;

    return [...filtered].sort((a, b) => {
      const aValue = a[orderBy as keyof Warehouse] as string;
      const bValue = b[orderBy as keyof Warehouse] as string;
      if (order === 'asc') {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });
  }, [warehousesData, searchTerm, order, orderBy]);

  const paginatedWarehouses = React.useMemo(() => {
    return sortedAndFilteredWarehouses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedAndFilteredWarehouses, page, rowsPerPage]);

  const columns: ColumnDef<Warehouse>[] = React.useMemo(() => [
    { key: 'name', header: 'Depo Adı', sortable: true, render: (row) => row.name, getValue: (row) => row.name },
    { key: 'address', header: 'Adres', sortable: true, render: (row) => row.address, getValue: (row) => row.address },
    {
      key: 'actions',
      header: 'İşlemler',
      sortable: false,
      render: (row) => (
        <Stack direction="row">
          {canManage && <Tooltip title="Düzenle"><IconButton size="small" onClick={() => handleEditClick(row)}><PencilIcon /></IconButton></Tooltip>}
          {canManage && <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => setWarehouseToDelete(row)}><TrashIcon /></IconButton></Tooltip>}
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
        title="Depo Yönetimi"
        action={ <Button variant="contained" onClick={() => setCreateFormOpen(prev => !prev)}>Yeni Depo Ekle</Button> }
      />
      <InlineCreateForm
        title="Yeni Depo Oluştur"
        isOpen={isCreateFormOpen}
        onClose={() => setCreateFormOpen(false)}
      >
        <form onSubmit={handleSubmit(handleCreateSubmit)}>
          {/* --- DEĞİŞİKLİK BURADA: Yatay Stack ile daha şık bir form --- */}
          <Stack direction="row" spacing={2} sx={{ p: 2 }} alignItems="flex-start">
            <ControlledFormField
              control={control}
              name="name"
              label="Depo Adı"
              required
              size="small"
              sx={{ flex: 1, minWidth: '200px' }} 
            />
            <ControlledFormField
              control={control}
              name="address"
              label="Adres"
              required
              size="small"
              sx={{ flex: 1, minWidth: '200px' }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ height: '40px' }} // Buton yüksekliğini input ile hizala
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Kaydet'}
            </Button>
          </Stack>
          {errors.root && (
            <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
              {errors.root.message}
            </Alert>
          )}
        </form>
      </InlineCreateForm>
      
      <ActionableTable
        columns={columns}
        rows={paginatedWarehouses}
        count={sortedAndFilteredWarehouses.length}
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
        entity="warehouses"
      />
      
      <Dialog open={!!warehouseToDelete} onClose={() => setWarehouseToDelete(null)}>
        <DialogTitle>Depoyu Sil</DialogTitle>
        <DialogContent><DialogContentText>Bu depoyu kalıcı olarak silmek istediğinizden emin misiniz?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setWarehouseToDelete(null)}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error">Sil</Button>
        </DialogActions>
      </Dialog>
      
      <WarehouseEditForm 
        open={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        onSuccess={handleEditSuccess} 
        warehouse={warehouseToEdit} 
      />
    </Stack>
  );
}