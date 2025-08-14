// Konum: src/app/dashboard/accounting/suppliers/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Stack, CircularProgress, Alert, Button } from '@mui/material';

// Ortak Bileşenler ve Hook'lar
import { PageHeader } from '@/components/common/PageHeader';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { useUser } from '@/hooks/use-user';

// Servis Katmanı ve Tipler
import { useSuppliers } from '@/services/supplierService';
import type { Supplier } from '@/types/nursery';
import { paths } from '@/paths';

export default function Page(): React.JSX.Element {
  // 1. Gerekli Hook'lar ve Veri Çekme
  const { user: currentUser } = useUser();
  const router = useRouter();
  const { data: suppliersData, error, isLoading } = useSuppliers();

  // 2. Tablo için State'ler
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = React.useState<string>('name');

  // Yetki Kontrolü
  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

  // 3. Sıralama Fonksiyonu
  const handleRequestSort = React.useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  // 4. Arama ve Sıralama İşlemleri
  const sortedAndFilteredSuppliers = React.useMemo(() => {
    const suppliers = suppliersData || [];
    
    const filtered = searchTerm
      ? suppliers.filter(s =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : suppliers;

    return [...filtered].sort((a, b) => {
      const aValue = (a as any)[orderBy] || '';
      const bValue = (b as any)[orderBy] || '';
      if (order === 'asc') {
        return String(aValue).localeCompare(String(bValue), 'tr');
      }
      return String(bValue).localeCompare(String(aValue), 'tr');
    });
  }, [suppliersData, searchTerm, order, orderBy]);

  // 5. Sayfalama
  const paginatedSuppliers = React.useMemo(() => {
    return sortedAndFilteredSuppliers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedAndFilteredSuppliers, page, rowsPerPage]);

  // 6. Sütun Tanımları
  const columns: ColumnDef<Supplier>[] = React.useMemo(() => [
    { key: 'name', header: 'Tedarikçi Adı', sortable: true, getValue: (row) => row.name, render: (row) => row.name },
    { key: 'contactPerson', header: 'Yetkili Kişi', sortable: true, getValue: (row) => row.contactPerson, render: (row) => row.contactPerson },
    { key: 'phone', header: 'Telefon', sortable: false, render: (row) => row.phone },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (row) => (
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => router.push(`${paths.dashboard.accounting.suppliers}/${row.id}`)}
        >
          Ekstreyi Görüntüle
        </Button>
      ),
    },
  ], [router]);
  
  // 7. Render Logic
  if (isLoading) return <Stack alignItems="center" justifyContent="center" sx={{minHeight: '80vh'}}><CircularProgress /></Stack>;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!canView) return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;

  return (
    <Stack spacing={3}>
      <AppBreadcrumbs />
      <PageHeader title="Cari Hesaplar (Tedarikçi)" />
      
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
        order={order}
        orderBy={orderBy}
        onSort={handleRequestSort}
        entity="supplier-accounts"
      />
    </Stack>
  );
}