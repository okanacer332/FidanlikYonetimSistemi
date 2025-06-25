// Dosya Yolu: client/src/app/dashboard/customers/page.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

import { useUser } from '@/hooks/use-user';
import type { Customer } from '@/types/nursery';
import { CustomerCreateInline, type CustomerFormValues } from '@/components/dashboard/customer/customer-create-inline';
import { CustomerEditForm } from '@/components/dashboard/customer/customer-edit-form';
import { CustomersTable } from '@/components/dashboard/customer/customers-table';

// Yeni modele göre Zod şemasını güncelliyoruz
const schema = zod.object({
  firstName: zod.string().min(2, { message: 'Müşteri adı en az 2 karakter olmalıdır.' }),
  lastName: zod.string().min(2, { message: 'Müşteri soyadı en az 2 karakter olmalıdır.' }),
  companyName: zod.string().optional(),
  phone: zod.string().min(10, { message: 'Geçerli bir telefon numarası giriniz.' }).max(20),
  email: zod.string().email({ message: 'Geçerli bir e-posta adresi giriniz.' }),
  address: zod.string().min(5, { message: 'Adres en az 5 karakter olmalıdır.' }),
});

export default function Page(): React.JSX.Element {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);

  const { user: currentUser } = useUser();
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [pageError, setPageError] = React.useState<string | null>(null);

  const [isEditModalOpen, setEditModalOpen] = React.useState(false);
  const [itemToEdit, setItemToEdit] = React.useState<Customer | null>(null);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [itemToDeleteId, setItemToDeleteId] = React.useState<string | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const canManageCustomers = currentUser?.roles?.some(role => ['ADMIN', 'SALES_PERSON', 'WAREHOUSE_STAFF'].includes(role.name));
  const canDeleteCustomers = currentUser?.roles?.some(role => role.name === 'ADMIN');

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    // Yeni modele göre varsayılan değerleri güncelliyoruz
    defaultValues: { firstName: '', lastName: '', companyName: '', phone: '', email: '', address: '' },
  });

  const fetchData = React.useCallback(async () => {
    if (!canManageCustomers) {
      setPageError('Bu sayfayı görüntüleme yetkiniz yok.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setPageError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error((await response.json()).message || 'Müşteriler yüklenemedi.');
      setCustomers(await response.json());
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [canManageCustomers]);

  React.useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  const onSubmit = React.useCallback(
    async (values: CustomerFormValues) => {
      setError('root', {});
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum bulunamadı.');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(values),
        });
        if (!response.ok) throw new Error((await response.json()).message || 'Müşteri oluşturulamadı.');
        reset();
        await fetchData();
      } catch (err) {
        setError('root', { type: 'server', message: err instanceof Error ? err.message : 'Bir hata oluştu.' });
      }
    },
    [fetchData, reset, setError]
  );

  const handleEditClick = (customer: Customer) => {
    setItemToEdit(customer);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setItemToEdit(null);
    fetchData();
  };

  const handleDeleteClick = (customerId: string) => {
    setItemToDeleteId(customerId);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDeleteId) return;
    setDeleteError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı.');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers/${itemToDeleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Müşteri silinemedi.');
      setConfirmDeleteOpen(false);
      setItemToDeleteId(null);
      fetchData();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Silme işlemi sırasında bir hata oluştu.');
    }
  };

  if (!isClient || loading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h4">Müşteri Yönetimi</Typography>
        <Stack sx={{ alignItems: 'center', mt: 3 }}>
          <CircularProgress />
        </Stack>
      </Stack>
    );
  }
  
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Müşteri Yönetimi</Typography>

      {pageError ? (
        <Alert severity="error">{pageError}</Alert>
      ) : (
        <>
          {canManageCustomers && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <CustomerCreateInline control={control} errors={errors} isSubmitting={isSubmitting} />
            </form>
          )}

          <CustomersTable
            rows={customers}
            onEdit={canManageCustomers ? handleEditClick : undefined}
            onDelete={canDeleteCustomers ? handleDeleteClick : undefined}
          />
        </>
      )}

      {canManageCustomers && itemToEdit && (
        <CustomerEditForm
          open={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          customer={itemToEdit}
        />
      )}

      <Dialog open={isConfirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Müşteriyi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>Bu müşteriyi kalıcı olarak silmek istediğinizden emin misiniz?</DialogContentText>
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>İptal</Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={!!deleteError}>
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}