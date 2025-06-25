// Dosya Yolu: client/src/app/dashboard/suppliers/page.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import {
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

import { useUser } from '@/hooks/use-user';
import type { Supplier } from '@/types/nursery';
import { SuppliersTable } from '@/components/dashboard/supplier/suppliers-table';
import { SupplierEditForm } from '@/components/dashboard/supplier/supplier-edit-form';
import { SupplierCreateInline } from '@/components/dashboard/supplier/supplier-create-inline';

const schema = zod.object({
  name: zod.string().min(2, { message: 'Tedarikçi adı en az 2 karakter olmalıdır.' }),
  contactPerson: zod.string().min(2, { message: 'Yetkili kişi adı en az 2 karakter olmalıdır.' }),
  phone: zod.string().min(10, { message: 'Geçerli bir telefon numarası giriniz.' }).max(20),
  email: zod.string().email({ message: 'Geçerli bir e-posta adresi giriniz.' }).optional().or(zod.literal('')),
  address: zod.string().min(5, { message: 'Adres en az 5 karakter olmalıdır.' }),
});

type FormValues = zod.infer<typeof schema>;

export default function Page(): React.JSX.Element {
  // --- ÇÖZÜM İÇİN EKLENEN KOD BAŞLANGICI ---
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  // --- ÇÖZÜM İÇİN EKLENEN KOD SONU ---

  const { user: currentUser } = useUser();
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [pageError, setPageError] = React.useState<string | null>(null);

  const [isEditModalOpen, setEditModalOpen] = React.useState(false);
  const [itemToEdit, setItemToEdit] = React.useState<Supplier | null>(null);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [itemToDeleteId, setItemToDeleteId] = React.useState<string | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const canManageSuppliers = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'WAREHOUSE_STAFF');
  const canDeleteSuppliers = currentUser?.roles?.some(role => role.name === 'ADMIN');

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', contactPerson: '', phone: '', email: '', address: '' },
  });

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Tedarikçiler yüklenemedi.');
      }
      setSuppliers(await response.json());
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // fetchData'yı sadece kullanıcı bilgisi geldikten ve component mount olduktan sonra çağır
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      setError('root', {}); 
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum bulunamadı.');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(values),
        });
        if (!response.ok) {
          throw new Error((await response.json()).message || 'Tedarikçi oluşturulamadı.');
        }
        reset(); 
        await fetchData(); 
      } catch (err) {
        setError('root', { type: 'server', message: err instanceof Error ? err.message : 'Bir hata oluştu.' });
      }
    },
    [fetchData, reset, setError]
  );
  
  const handleEditClick = (supplier: Supplier) => {
    setItemToEdit(supplier);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setItemToEdit(null);
    fetchData();
  };

  const handleDeleteClick = (supplierId: string) => {
    setItemToDeleteId(supplierId);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDeleteId) return;
    setDeleteError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers/${itemToDeleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error((await response.json()).message || 'Tedarikçi silinemedi.');
      }
      setConfirmDeleteOpen(false);
      setItemToDeleteId(null);
      fetchData();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Silme işlemi sırasında bir hata oluştu.');
    }
  };

  // --- ÇÖZÜM İÇİN GÜNCELLENEN KISIM ---
  // Sayfa içeriğini sadece isClient true olduğunda göster
  if (!isClient || loading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h4">Tedarikçi Yönetimi</Typography>
        <Stack sx={{ alignItems: 'center', mt: 3 }}><CircularProgress /></Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Tedarikçi Yönetimi</Typography>
      
      {pageError ? (
        <Alert severity="error">{pageError}</Alert>
      ) : (
        <>
          {canManageSuppliers && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <SupplierCreateInline control={control} errors={errors} isSubmitting={isSubmitting} />
            </form>
          )}

          <SuppliersTable
            rows={suppliers}
            onEdit={canManageSuppliers ? handleEditClick : undefined}
            onDelete={canDeleteSuppliers ? handleDeleteClick : undefined}
          />
        </>
      )}

      {canManageSuppliers && (
        <SupplierEditForm
          open={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          supplier={itemToEdit}
        />
      )}

      <Dialog open={isConfirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Tedarikçiyi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>Bu tedarikçiyi kalıcı olarak silmek istediğinizden emin misiniz?</DialogContentText>
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