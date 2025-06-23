'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Stack, Typography, CircularProgress, Alert, Breadcrumbs, Link as MuiLink } from '@mui/material';
import NextLink from 'next/link';

import type { Invoice, Customer } from '@/types/nursery';
import { paths } from '@/paths';
// DÜZELTME: 'InvoiceDetailView' bileşeni, varsayılan (default) export olduğu için süslü parantezler olmadan import edildi.
import InvoiceDetailView from '@/components/dashboard/invoicing/invoice-detail-view';

export default function Page(): React.JSX.Element {
  const params = useParams();
  const invoiceId = params.invoiceId as string | undefined;

  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!invoiceId) {
      setError('Fatura kimliği bulunamadı.');
      setLoading(false);
      return;
    }

    const fetchInvoiceDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum bulunamadı.');

        const invoiceRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices/${invoiceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!invoiceRes.ok) {
            throw new Error('Fatura verileri yüklenemedi.');
        }

        const invoiceData: Invoice = await invoiceRes.json();
        setInvoice(invoiceData);

        // Müşteri bilgisini çek
        const customerRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers/${invoiceData.customerId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!customerRes.ok) {
            throw new Error('Müşteri bilgisi yüklenemedi.');
        }

        setCustomer(await customerRes.json());

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId]);

  if (loading) {
    return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!invoice || !customer) {
    return <Alert severity="warning">Fatura veya müşteri bilgisi bulunamadı.</Alert>;
  }

  return (
     <Stack spacing={3}>
        <Breadcrumbs separator=">">
            <MuiLink component={NextLink} href={paths.dashboard.accounting.invoices}>
                Faturalar
            </MuiLink>
            <Typography>Fatura Detayı</Typography>
        </Breadcrumbs>
        
        <InvoiceDetailView invoice={invoice} customer={customer} />
    </Stack>
  );
}
