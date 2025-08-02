'use client';

import * as React from 'react';
import NextLink from 'next/link'; // YENİ: Linkleme için import edildi
import { Stack, CircularProgress, Alert, Chip, Typography, IconButton, Tooltip } from '@mui/material'; // IconButton ve Tooltip eklendi
import { Eye as EyeIcon } from '@phosphor-icons/react'; // YENİ: Görüntüleme ikonu eklendi
import dayjs from 'dayjs';

// Ortak Bileşenler ve Hook'lar
import { PageHeader } from '@/components/common/PageHeader';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { useUser } from '@/hooks/use-user';

// Servis Katmanı
import { useInvoices } from '@/services/invoiceService';
import { useCustomers } from '@/services/customerService';
import { useSuppliers } from '@/services/supplierService';

// Tipler
import type { Invoice } from '@/types/nursery';
import { InvoiceStatus } from '@/types/nursery';

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  
  const { data: invoicesData, error: invoicesError, isLoading: isLoadingInvoices } = useInvoices();
  const { data: customersData, error: customersError, isLoading: isLoadingCustomers } = useCustomers();
  const { data: suppliersData, error: suppliersError, isLoading: isLoadingSuppliers } = useSuppliers();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = React.useState<string>('issueDate');

  const isLoading = isLoadingInvoices || isLoadingCustomers || isLoadingSuppliers;
  const error = invoicesError || customersError || suppliersError;
  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

  const handleRequestSort = React.useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  const customerMap = React.useMemo(() => new Map(customersData?.map(c => [c.id, `${c.firstName} ${c.lastName}`])), [customersData]);
  
  const getPartyName = (invoice: Invoice) => {
    return customerMap.get(invoice.customerId) || 'Silinmiş Müşteri';
  };

  const sortedAndFilteredInvoices = React.useMemo(() => {
    const invoices = invoicesData || [];
    const filtered = searchTerm
      ? invoices.filter(i => 
          i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getPartyName(i).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : invoices;
    
    return [...filtered].sort((a, b) => {
        const aValue = (a as any)[orderBy] || '';
        const bValue = (b as any)[orderBy] || '';
        const comparison = String(aValue).localeCompare(String(bValue));
        return order === 'asc' ? comparison : -comparison;
    });
  }, [invoicesData, searchTerm, order, orderBy, customerMap]);

  const paginatedInvoices = React.useMemo(() => {
    return sortedAndFilteredInvoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedAndFilteredInvoices, page, rowsPerPage]);

  const columns: ColumnDef<Invoice>[] = React.useMemo(() => [
    { key: 'invoiceNumber', header: 'Fatura No', sortable: true, render: (row) => row.invoiceNumber, getValue: (row) => row.invoiceNumber },
    { key: 'customerId', header: 'İlişkili Müşteri', sortable: false, render: (row) => getPartyName(row), getValue: (row) => getPartyName(row) },
    { key: 'issueDate', header: 'Tarih', sortable: true, render: (row) => dayjs(row.issueDate).format('DD.MM.YYYY'), getValue: (row) => row.issueDate },
    { key: 'dueDate', header: 'Vade Tarihi', sortable: true, render: (row) => dayjs(row.dueDate).format('DD.MM.YYYY'), getValue: (row) => row.dueDate },
    { key: 'totalAmount', header: 'Tutar', sortable: true, render: (row) => 
      <Typography fontWeight="bold">
        {row.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
      </Typography>, 
      getValue: (row) => row.totalAmount
    },
    { key: 'status', header: 'Durum', sortable: true, render: (row) =>
      <Chip
        label={row.status === InvoiceStatus.PAID ? 'Ödendi' : row.status === InvoiceStatus.CANCELED ? 'İptal' : 'Ödenmedi'}
        color={row.status === InvoiceStatus.PAID ? 'success' : row.status === InvoiceStatus.CANCELED ? 'default' : 'error'}
        size="small"
      />,
      getValue: (row) => row.status
    },
    // --- YENİ EKLENEN "İŞLEMLER" KOLONU ---
    {
      key: 'actions',
      header: 'İşlemler',
      sortable: false,
      render: (row) => (
        <Tooltip title="Faturayı Görüntüle">
          <IconButton
            component={NextLink}
            href={`/dashboard/accounting/invoices/${row.id}`}
            size="small"
          >
            <EyeIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ], [customerMap]);

  if (isLoading) return <Stack alignItems="center" justifyContent="center" sx={{minHeight: '80vh'}}><CircularProgress /></Stack>;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!canView) return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;

  return (
    <Stack spacing={3}>
      <AppBreadcrumbs />
      <PageHeader title="Fatura Yönetimi" />
      
      <ActionableTable
        columns={columns}
        rows={paginatedInvoices}
        count={sortedAndFilteredInvoices.length}
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
        entity="invoices"
      />
    </Stack>
  );
}