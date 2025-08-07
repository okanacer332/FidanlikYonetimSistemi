'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import {
  Box, Card, CardContent, CircularProgress, Divider, Grid, Stack,
  Table, TableBody, TableCell, TableHead, TableRow, Typography, Alert, Button
} from '@mui/material';
import { Download as DownloadIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';

import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { PageHeader } from '@/components/common/PageHeader';
import { useUser } from '@/hooks/use-user';
import { useApiSWR } from '@/hooks/use-api-swr';
import type { Invoice, Customer } from '@/types/nursery';

const useInvoice = (id: string | null) => useApiSWR<Invoice>(id ? `/invoices/${id}` : null);
const useCustomer = (id: string | null) => useApiSWR<Customer>(id ? `/customers/${id}` : null);

export default function Page(): React.JSX.Element {
  const params = useParams();
  const invoiceId = params.invoiceId as string | null;

  const { user: currentUser } = useUser();
  const { data: invoice, error: invoiceError, isLoading: isLoadingInvoice } = useInvoice(invoiceId);
  const { data: customer, error: customerError, isLoading: isLoadingCustomer } = useCustomer(invoice ? invoice.customerId : null);

  const isLoading = isLoadingInvoice || isLoadingCustomer;
  const error = invoiceError || customerError;
  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

  const handleDownloadPdf = () => {
    // PDF indirme fonksiyonu burada olacak
    alert('PDF indirme fonksiyonu henüz aktif değil.');
  };

  if (isLoading) return <Stack sx={{ width: '100%', alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!canView) return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;
  if (!invoice) return <Alert severity="warning">Fatura bulunamadı.</Alert>;

  const subtotal = invoice.items.reduce((acc, item) => acc + item.totalPrice, 0);
  const taxRate = 0.20; // Varsayılan KDV oranı
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  return (
    <Stack spacing={3}>
      <AppBreadcrumbs />
      <PageHeader 
        title={`Fatura #${invoice.invoiceNumber}`} 
        action={
          <Button color="primary" startIcon={<DownloadIcon />} variant="contained" onClick={handleDownloadPdf}>
            PDF İndir
          </Button>
        }
      />
      
      <Card>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {/* --- Şirket Bilgileri ve Logo --- */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
            <Box>
              <Typography variant="h6" gutterBottom>FidanYS A.Ş.</Typography>
              <Typography variant="body2" color="text.secondary">Teknopark, Malatya</Typography>
              <Typography variant="body2" color="text.secondary">vergi@fidanys.xyz</Typography>
            </Box>
            <Box sx={{ width: 120, height: 'auto' }}>
              <img src="/assets/acrtech-fidanfys-logo.png" alt="FidanFYS Logo" style={{ width: '100%', height: 'auto' }} />
            </Box>
          </Stack>
          
          <Divider sx={{ my: 3 }} />

          {/* --- Müşteri ve Fatura Detayları --- */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>FATURA KESİLEN</Typography>
              {customer ? (
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1">{customer.firstName} {customer.lastName}</Typography>
                  <Typography variant="body2">{customer.companyName || ''}</Typography>
                  <Typography variant="body2">{customer.address}</Typography>
                  <Typography variant="body2">{customer.phone}</Typography>
                </Stack>
              ) : <CircularProgress size={20} />}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { md: 'right' } }}>
               <Stack spacing={0.5} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                 <Typography variant="subtitle2" color="text.secondary">Fatura No</Typography>
                 <Typography variant="body1" fontWeight={500}>{invoice.invoiceNumber}</Typography>
                 <Typography variant="subtitle2" color="text.secondary" sx={{mt: 1}}>Fatura Tarihi</Typography>
                 <Typography variant="body1">{dayjs(invoice.issueDate).format('DD.MM.YYYY')}</Typography>
               </Stack>
            </Grid>
          </Grid>
          
          {/* --- Fatura Kalemleri --- */}
          <Box sx={{ mt: 4, overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Açıklama</TableCell>
                  <TableCell align="right">Miktar</TableCell>
                  <TableCell align="right">Birim Fiyat</TableCell>
                  <TableCell align="right">Toplam</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{item.unitPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</TableCell>
                    <TableCell align="right">{item.totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          
          {/* --- Toplamlar --- */}
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <Box sx={{ maxWidth: '300px', width: '100%' }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Ara Toplam:</Typography>
                  <Typography>{subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">KDV (%{taxRate * 100}):</Typography>
                  <Typography>{taxAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6">Genel Toplam:</Typography>
                  <Typography variant="h6">{grandTotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>

        </CardContent>
      </Card>
    </Stack>
  );
}