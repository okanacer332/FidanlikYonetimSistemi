// Konum: src/app/dashboard/accounting/invoices/page.tsx
'use client';

import * as React from 'react';
import NextLink from 'next/link';
import { Stack, CircularProgress, Alert, Chip, Typography, IconButton, Tooltip } from '@mui/material';
import { Eye as EyeIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';

// Ortak Bileşenler ve Hook'lar
import { PageHeader } from '@/components/common/PageHeader';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { useUser } from '@/hooks/use-user';

// Servis Katmanı ve Tipler
import { useInvoices } from '@/services/invoiceService';
import { useCustomers } from '@/services/customerService';
import type { Invoice } from '@/types/nursery';
import { InvoiceStatus } from '@/types/nursery';
import { paths } from '@/paths';

// Fatura durumları için Türkçe harita
const statusMap: Record<string, { label: string; color: 'success' | 'warning' | 'info' | 'error' | 'default' }> = {
  [InvoiceStatus.PAID]: { label: 'Ödendi', color: 'success' },
  [InvoiceStatus.SENT]: { label: 'Gönderildi', color: 'info' },
  [InvoiceStatus.DRAFT]: { label: 'Taslak', color: 'default' },
  [InvoiceStatus.CANCELED]: { label: 'İptal Edildi', color: 'error' },
};

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const { data: invoicesData, error: invoicesError, isLoading: isLoadingInvoices } = useInvoices();
  const { data: customersData, error: customersError, isLoading: isLoadingCustomers } = useCustomers();

  // State'ler
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = React.useState<string>('issueDate');

  const isLoading = isLoadingInvoices || isLoadingCustomers;
  const error = invoicesError || customersError;
  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

  const handleRequestSort = React.useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  const customerMap = React.useMemo(() => new Map(customersData?.map(c => [c.id, `${c.firstName} ${c.lastName}`])), [customersData]);
  const getPartyName = (invoice: Invoice) => customerMap.get(invoice.customerId) || 'Silinmiş Müşteri';

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
        const comparison = String(aValue).localeCompare(String(bValue), 'tr');
        return order === 'asc' ? comparison : -comparison;
    });
  }, [invoicesData, searchTerm, order, orderBy, customerMap]);

  const paginatedInvoices = React.useMemo(() => {
    return sortedAndFilteredInvoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedAndFilteredInvoices, page, rowsPerPage]);

  const columns: ColumnDef<Invoice>[] = React.useMemo(() => [
    { key: 'invoiceNumber', header: 'Fatura No', sortable: true, getValue: (row) => row.invoiceNumber, render: (row) => row.invoiceNumber },
    { key: 'customerId', header: 'Müşteri', sortable: false, getValue: (row) => getPartyName(row), render: (row) => getPartyName(row) },
    { key: 'issueDate', header: 'Tarih', sortable: true, getValue: (row) => row.issueDate, render: (row) => dayjs(row.issueDate).format('DD.MM.YYYY') },
    { key: 'totalAmount', header: 'Tutar', sortable: true, getValue: (row) => row.totalAmount, render: (row) => row.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) },
    { 
      key: 'status', 
      header: 'Durum', 
      sortable: true, 
      getValue: (row) => row.status, 
      render: (row) => {
        const statusInfo = statusMap[row.status] || { label: row.status, color: 'default' };
        return <Chip label={statusInfo.label} color={statusInfo.color} size="small" variant="outlined" />;
      }
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (row) => (
        <Tooltip title="Faturayı Görüntüle">
          {/* DÜZELTME: `paths.dashboard.muhasebe.invoices` olarak güncellendi */}
          <IconButton component={NextLink} href={`${paths.dashboard.muhasebe.invoices}/${row.id}`} size="small">
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