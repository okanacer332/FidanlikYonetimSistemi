// Konum: src/app/dashboard/accounting/payments/page.tsx
'use client';

import * as React from 'react';
import { Stack, CircularProgress, Alert, Chip, Typography } from '@mui/material';
import dayjs from 'dayjs';

// Ortak Bileşenler ve Hook'lar
import { PageHeader } from '@/components/common/PageHeader';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { useUser } from '@/hooks/use-user';
import { useApiSWR } from '@/hooks/use-api-swr';

// Servis Katmanı ve Tipler
import { usePayments } from '@/services/paymentService';
import { useCustomers } from '@/services/customerService';
import { useSuppliers } from '@/services/supplierService';
import type { Payment, Customer, Supplier } from '@/types/nursery';
import { PaymentMethod, PaymentType, RelatedEntityType } from '@/types/nursery';

// SWR Hook'ları
const usePaymentsData = () => useApiSWR<Payment[]>('/payments');

export default function Page(): React.JSX.Element {
  // 1. Gerekli Hook'lar ve Veri Çekme
  const { user: currentUser } = useUser();
  const { data: paymentsData, error: paymentsError, isLoading: isLoadingPayments } = usePaymentsData();
  const { data: customersData, error: customersError, isLoading: isLoadingCustomers } = useCustomers();
  const { data: suppliersData, error: suppliersError, isLoading: isLoadingSuppliers } = useSuppliers();

  // 2. Tablo için State'ler
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = React.useState<string>('paymentDate');

  const isLoading = isLoadingPayments || isLoadingCustomers || isLoadingSuppliers;
  const error = paymentsError || customersError || suppliersError;
  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

  // 3. Sıralama Fonksiyonu
  const handleRequestSort = React.useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  // 4. Veri Birleştirme, Arama ve Sıralama
  const customerMap = React.useMemo(() => new Map(customersData?.map(c => [c.id, `${c.firstName} ${c.lastName}`])), [customersData]);
  const supplierMap = React.useMemo(() => new Map(suppliersData?.map(s => [s.id, s.name])), [suppliersData]);
  
  const getRelatedName = React.useCallback((payment: Payment) => {
    if (payment.relatedEntityType === RelatedEntityType.CUSTOMER) return customerMap.get(payment.relatedId) || 'Bilinmeyen Müşteri';
    if (payment.relatedEntityType === RelatedEntityType.SUPPLIER) return supplierMap.get(payment.relatedId) || 'Bilinmeyen Tedarikçi';
    if (payment.relatedEntityType === RelatedEntityType.EXPENSE) return 'Gider Kaydı';
    return 'N/A';
  }, [customerMap, supplierMap]);

  const sortedAndFilteredPayments = React.useMemo(() => {
    const payments = paymentsData || [];
    const filtered = searchTerm
      ? payments.filter(p => 
          getRelatedName(p).toLowerCase().includes(searchTerm.toLowerCase()) || 
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : payments;
    
    return [...filtered].sort((a, b) => {
        const aValue = (a as any)[orderBy] || '';
        const bValue = (b as any)[orderBy] || '';
        const comparison = String(aValue).localeCompare(String(bValue), 'tr');
        return order === 'asc' ? comparison : -comparison;
    });
  }, [paymentsData, searchTerm, order, orderBy, getRelatedName]);

  const paginatedPayments = React.useMemo(() => {
    return sortedAndFilteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedAndFilteredPayments, page, rowsPerPage]);

  // 5. Sütun Tanımları
  const columns: ColumnDef<Payment>[] = React.useMemo(() => [
    { key: 'paymentDate', header: 'Tarih', sortable: true, getValue: (row) => row.paymentDate, render: (row) => dayjs(row.paymentDate).format('DD.MM.YYYY') },
    { key: 'type', header: 'İşlem Tipi', sortable: true, getValue: (row) => row.type, render: (row) => 
        <Chip 
          label={row.type === PaymentType.COLLECTION ? 'Tahsilat' : 'Tediye'} 
          color={row.type === PaymentType.COLLECTION ? 'success' : 'error'} 
          size="small" variant="outlined" 
        />
    },
    { key: 'relatedId', header: 'İlişkili Taraf', sortable: false, getValue: (row) => getRelatedName(row), render: (row) => getRelatedName(row) },
    { key: 'description', header: 'Açıklama', sortable: true, getValue: (row) => row.description, render: (row) => row.description },
    { key: 'method', header: 'Ödeme Yöntemi', sortable: true, getValue: (row) => row.method, render: (row) => 
        row.method === PaymentMethod.CASH ? 'Nakit' : row.method === PaymentMethod.BANK_TRANSFER ? 'Banka Transferi' : 'Kredi Kartı'
    },
    { key: 'amount', header: 'Tutar', sortable: true, getValue: (row) => row.amount, render: (row) => 
      <Typography color={row.type === PaymentType.COLLECTION ? 'success.main' : 'error.main'} fontWeight="bold">
        {row.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
      </Typography>
    },
  ], [getRelatedName]);

  // 6. Render Logic
  if (isLoading) return <Stack alignItems="center" justifyContent="center" sx={{minHeight: '80vh'}}><CircularProgress /></Stack>;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!canView) return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;

  return (
    <Stack spacing={3}>
      <AppBreadcrumbs />
      <PageHeader title="Kasa & Banka Hareketleri" />
      
      <ActionableTable
        columns={columns}
        rows={paginatedPayments}
        count={sortedAndFilteredPayments.length}
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
        entity="payments"
      />
    </Stack>
  );
}