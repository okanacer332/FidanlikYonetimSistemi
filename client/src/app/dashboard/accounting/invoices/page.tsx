'use client';

import * as React from 'react';
import { Stack, Typography, CircularProgress, Alert, Card, Box } from '@mui/material';

import { useUser } from '@/hooks/use-user';
import type { Invoice, Customer } from '@/types/nursery';
import { InvoicesTable, type InvoiceRow } from '@/components/dashboard/invoicing/invoices-table';

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

  React.useEffect(() => {
    const fetchData = async () => {
      if (!canView) {
        setError('Bu sayfayı görüntüleme yetkiniz yok.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum bulunamadı.');

        const [invoicesRes, customersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!invoicesRes.ok || !customersRes.ok) {
          throw new Error('Veriler yüklenirken bir hata oluştu.');
        }

        setInvoices(await invoicesRes.json());
        setCustomers(await customersRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [canView]);

  const preparedData = React.useMemo((): InvoiceRow[] => {
    const customerMap = new Map(customers.map(c => [c.id, `${c.firstName} ${c.lastName}`]));

    return invoices
      .map(invoice => ({
        ...invoice,
        customerName: customerMap.get(invoice.customerId) || 'Bilinmeyen Müşteri',
      }))
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  }, [invoices, customers]);

  if (loading) {
    return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Faturalar</Typography>
      <InvoicesTable rows={preparedData} />
    </Stack>
  );
}
