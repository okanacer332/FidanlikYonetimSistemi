'use client';

import * as React from 'react';
import { Stack, CircularProgress, Alert, Chip, Typography } from '@mui/material';
import dayjs from 'dayjs';

// Ortak Bileşenler ve Hook'lar
import { PageHeader } from '@/components/common/PageHeader';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { useNotifier } from '@/hooks/useNotifier';
import { useUser } from '@/hooks/use-user';

// Servis Katmanı
import { usePayments } from '@/services/paymentService';
import { useCustomers } from '@/services/customerService';
import { useSuppliers } from '@/services/supplierService';

// Tipler
import type { Payment, Customer, Supplier } from '@/types/nursery';
import { PaymentType, PaymentMethod, RelatedEntityType } from '@/types/nursery';

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  
  // Üç farklı veri kaynağını SWR ile paralel olarak çekiyoruz
  const { data: paymentsData, error: paymentsError, isLoading: isLoadingPayments } = usePayments();
  const { data: customersData, error: customersError, isLoading: isLoadingCustomers } = useCustomers();
  const { data: suppliersData, error: suppliersError, isLoading: isLoadingSuppliers } = useSuppliers();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = React.useState<string>('paymentDate');

  const isLoading = isLoadingPayments || isLoadingCustomers || isLoadingSuppliers;
  const error = paymentsError || customersError || suppliersError;
  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

  const handleRequestSort = React.useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  // Müşteri ve Tedarikçi isimlerini kolayca bulmak için Map'ler oluşturuyoruz
  const customerMap = React.useMemo(() => new Map(customersData?.map(c => [c.id, `${c.firstName} ${c.lastName}`])), [customersData]);
  const supplierMap = React.useMemo(() => new Map(suppliersData?.map(s => [s.id, s.name])), [suppliersData]);

  const getRelatedName = (payment: Payment) => {
    if (payment.relatedEntityType === RelatedEntityType.CUSTOMER) return customerMap.get(payment.relatedId) || 'Bilinmeyen Müşteri';
    if (payment.relatedEntityType === RelatedEntityType.SUPPLIER) return supplierMap.get(payment.relatedId) || 'Bilinmeyen Tedarikçi';
    if (payment.relatedEntityType === RelatedEntityType.EXPENSE) return 'Gider Kaydı';
    return 'N/A';
  };

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
        const comparison = String(aValue).localeCompare(String(bValue));
        return order === 'asc' ? comparison : -comparison;
    });
  }, [paymentsData, searchTerm, order, orderBy, customerMap, supplierMap]);

  const paginatedPayments = React.useMemo(() => {
    return sortedAndFilteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedAndFilteredPayments, page, rowsPerPage]);

  const columns: ColumnDef<Payment>[] = React.useMemo(() => [
    { key: 'paymentDate', header: 'Tarih', sortable: true, render: (row) => dayjs(row.paymentDate).format('DD.MM.YYYY'), getValue: (row) => row.paymentDate },
    { key: 'type', header: 'İşlem Tipi', sortable: true, render: (row) => 
        <Chip 
          label={row.type === PaymentType.COLLECTION ? 'Tahsilat' : 'Tediye'} 
          color={row.type === PaymentType.COLLECTION ? 'success' : 'error'} 
          size="small" variant="outlined" 
        />, 
      getValue: (row) => row.type 
    },
    { key: 'relatedId', header: 'İlişkili Taraf', sortable: false, render: (row) => getRelatedName(row), getValue: (row) => getRelatedName(row) },
    { key: 'description', header: 'Açıklama', sortable: true, render: (row) => row.description, getValue: (row) => row.description },
    { key: 'method', header: 'Ödeme Yöntemi', sortable: true, render: (row) => 
        row.method === PaymentMethod.CASH ? 'Nakit' : row.method === PaymentMethod.BANK_TRANSFER ? 'Banka Transferi' : 'Kredi Kartı', 
      getValue: (row) => row.method 
    },
    { key: 'amount', header: 'Tutar', sortable: true, render: (row) => 
      <Typography color={row.type === PaymentType.COLLECTION ? 'success.main' : 'error.main'} fontWeight="bold">
        {row.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
      </Typography>, 
      getValue: (row) => row.amount
    },
  ], [customerMap, supplierMap]);

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