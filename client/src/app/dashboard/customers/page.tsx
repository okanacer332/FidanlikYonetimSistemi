// client/src/app/dashboard/customers/page.tsx
'use client';

import * as React from 'react';
import { Button, Stack, Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';

import { CustomersTable } from '@/components/dashboard/customer/customers-table';
import { CustomerCreateForm } from '@/components/dashboard/customer/customer-create-form';
import { CustomerEditForm } from '@/components/dashboard/customer/customer-edit-form';
import type { Customer } from '@/types/nursery';
import { useUser } from '@/hooks/use-user';

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
  const [totalCustomers, setTotalCustomers] = React.useState<number>(0);

  // Modal state'leri
  const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setEditModalOpen] = React.useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  
  // İşlem yapılacak öğe state'leri
  const [itemToEdit, setItemToEdit] = React.useState<Customer | null>(null);
  const [itemToDeleteId, setItemToDeleteId] = React.useState<string | null>(null);

  // Yetki kontrolü (Listeleme yetkisi olan tüm roller)
  const canListCustomers = currentUser?.roles?.some(role =>
    role.name === 'Yönetici' || role.name === 'Satış Personeli' || role.name === 'Depo Sorumlusu'
  );
  // Oluşturma/Güncelleme yetkisi olan roller
  const canCreateEditCustomers = currentUser?.roles?.some(role =>
    role.name === 'Yönetici' || role.name === 'Satış Personeli'
  );
  // Silme yetkisi olan roller
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
          setTotalCustomers(data.length);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
      } finally {
          setLoading(false);
      }
  }, []);

  React.useEffect(() => {
      // Listeleme yetkisi olanlar fetch etsin
      if (canListCustomers) {
          fetchCustomers();
      } else {
          setLoading(false);
          setError('Müşteri listeleme yetkiniz bulunmamaktadır.');
      }
  }, [fetchCustomers, canListCustomers]); // canListCustomers bağımlılığı eklendi

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
                  {canCreateEditCustomers && ( // Sadece yetkili olanlar Ekle butonu görebilsin
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
                  // Sadece oluşturma/güncelleme yetkisi olanlar düzenleyebilsin
                  onEdit={canCreateEditCustomers ? handleEditClick : () => { /* noop */ }}
                  // Sadece silme yetkisi olanlar silebilsin
                  onDelete={canDeleteCustomers ? handleDeleteClick : () => { /* noop */ }}
              />
          )}
          
          {canCreateEditCustomers && ( // Sadece yetkili olanlar formu açabilsin
              <CustomerCreateForm
                  open={isCreateModalOpen}
                  onClose={() => setCreateModalOpen(false)}
                  onSuccess={handleCreateSuccess}
              />
          )}
          
          {canCreateEditCustomers && ( // Sadece yetkili olanlar formu açabilsin
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