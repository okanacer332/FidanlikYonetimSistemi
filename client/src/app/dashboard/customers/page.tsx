// client/src/app/dashboard/customers/page.tsx
'use client';

import * as React from 'react';
import { Button, Stack, Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';

import { CustomersTable } from '@/components/dashboard/customer/customers-table';
import { CustomerCreateForm } from '@/components/dashboard/customer/customer-create-form';
import { CustomerEditForm } from '@/components/dashboard/customer/customer-edit-form'; // Eklendi
import type { Customer } from '@/types/nursery'; // Güncellenen Customer tipi
import { useUser } from '@/hooks/use-user'; // Yetkilendirme için User hook'unu import edin

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState<number>(0); // Sayfalama için
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10); // Sayfalama için
  const [totalCustomers, setTotalCustomers] = React.useState<number>(0); // Sayfalama için

  // Modal state'leri
  const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setEditModalOpen] = React.useState(false); // Eklendi
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false); // Eklendi
  
  // İşlem yapılacak öğe state'leri
  const [itemToEdit, setItemToEdit] = React.useState<Customer | null>(null); // Eklendi
  const [itemToDeleteId, setItemToDeleteId] = React.useState<string | null>(null); // Eklendi

  // Yetki kontrolü
  const canManageCustomers = currentUser?.roles?.some(role => 
    role.name === 'Yönetici' || role.name === 'Satış Personeli'
  );
  const canDeleteCustomers = currentUser?.roles?.some(role => 
    role.name === 'Yönetici'
  );

  const fetchCustomers = React.useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
          const token = localStorage.getItem('authToken');
          if (!token) throw new Error('Oturum bulunamadı.');

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`, {
              headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.message || 'Müşteriler yüklenemedi.');
          }
          const data = await response.json();
          setCustomers(data);
          setTotalCustomers(data.length); // Toplam müşteri sayısını ayarla
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
      } finally {
          setLoading(false);
      }
  }, []);

  React.useEffect(() => {
      if (canManageCustomers) { // Sadece yetkili kullanıcılar veriyi çekebilir
          fetchCustomers();
      } else {
          setLoading(false);
          setError('Müşteri listeleme yetkiniz bulunmamaktadır.');
      }
  }, [fetchCustomers, canManageCustomers]);

  // Sayfalama handler'ları
  const handlePageChange = React.useCallback((event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  // ---- Create Handlers ----
  const handleCreateSuccess = () => {
      setCreateModalOpen(false);
      fetchCustomers();
  };
  
  // ---- Edit Handlers ----
  const handleEditClick = (customer: Customer) => {
      setItemToEdit(customer);
      setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
      setEditModalOpen(false);
      setItemToEdit(null);
      fetchCustomers();
  };

  // ---- Delete Handlers ----
  const handleDeleteClick = (customerId: string) => {
      setItemToDeleteId(customerId);
      setConfirmDeleteOpen(true);
  };
  
  const handleConfirmDelete = async () => {
      if (!itemToDeleteId) return;
      setError(null);
      try {
          const token = localStorage.getItem('authToken');
          if (!token) throw new Error('Oturum bulunamadı.');
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers/${itemToDeleteId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!response.ok) {
               const errData = await response.json();
               throw new Error(errData.message || 'Müşteri silinemedi.');
          }
          
          setConfirmDeleteOpen(false);
          setItemToDeleteId(null);
          fetchCustomers();
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Silme işlemi sırasında bir hata oluştu.');
          setConfirmDeleteOpen(false); // Hata durumunda da modalı kapat
      }
  };

  const paginatedCustomers = React.useMemo(() => {
    return customers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [customers, page, rowsPerPage]);
      
  return (
      <Stack spacing={3}>
          <Stack direction="row" spacing={3}>
              <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                  <Typography variant="h4">Müşteriler</Typography>
              </Stack>
              <div>
                  {canManageCustomers && (
                      <Button
                          startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                          variant="contained"
                          onClick={() => setCreateModalOpen(true)}
                      >
                          Yeni Müşteri Ekle
                      </Button>
                  )}
              </div>
          </Stack>

          {loading ? (
              <Stack sx={{ alignItems: 'center', mt: 3 }}><CircularProgress /></Stack>
          ) : error ? (
              <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          ) : (
              <CustomersTable 
                  count={totalCustomers}
                  page={page}
                  rows={paginatedCustomers}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  onEdit={canManageCustomers ? handleEditClick : () => {}} // Yetki yoksa düzenlemeyi devre dışı bırak
                  onDelete={canDeleteCustomers ? handleDeleteClick : () => {}} // Yetki yoksa silmeyi devre dışı bırak
              />
          )}
          
          {canManageCustomers && (
              <CustomerCreateForm 
                  open={isCreateModalOpen} 
                  onClose={() => setCreateModalOpen(false)}
                  onSuccess={handleCreateSuccess}
              /> 
          )}
          
          {canManageCustomers && (
              <CustomerEditForm
                  open={isEditModalOpen}
                  onClose={() => setEditModalOpen(false)}
                  onSuccess={handleEditSuccess}
                  customer={itemToEdit}
              />
          )}

          <Dialog open={isConfirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
              <DialogTitle>Müşteriyi Silmek İstediğinize Emin Misiniz?</DialogTitle>
              <DialogContent>
                  <DialogContentText>
                      Bu işlem geri alınamaz. Müşteri kalıcı olarak silinecektir.
                  </DialogContentText>
              </DialogContent>
              <DialogActions>
                  <Button onClick={() => setConfirmDeleteOpen(false)}>İptal</Button>
                  <Button onClick={handleConfirmDelete} color="error">Sil</Button>
              </DialogActions>
          </Dialog>
      </Stack>
  );
}