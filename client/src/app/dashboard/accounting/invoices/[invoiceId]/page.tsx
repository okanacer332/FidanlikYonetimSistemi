'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Alert
} from '@mui/material';
import dayjs from 'dayjs';

// Ortak Bileşenler ve Hook'lar
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { PageHeader } from '@/components/common/PageHeader';
import { useUser } from '@/hooks/use-user';
import { useInvoice } from '@/services/invoiceService';
import { useCustomer } from '@/services/customerService'; // Artık doğru şekilde import edilecek

// Tipler
import type { Invoice } from '@/types/nursery';

export default function Page(): React.JSX.Element {
  const { id: invoiceId } = useParams<{ id: string }>();
  const { user: currentUser } = useUser();

  // Adım 1: Fatura verisini SWR ile çek
  const { data: invoice, error: invoiceError, isLoading: isLoadingInvoice } = useInvoice(invoiceId);
  
  // Adım 2: Fatura verisi yüklendikten sonra müşteri verisini SWR ile çek
  const { data: customer, error: customerError, isLoading: isLoadingCustomer } = useCustomer(invoice?.customerId);

  const isLoading = isLoadingInvoice || (invoice && isLoadingCustomer);
  const error = invoiceError || customerError;
  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

  if (isLoading) {
    return <Stack sx={{ width: '100%', alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
  }

  if (error) {
    return <Alert severity="error">{error.message || 'Fatura yüklenirken bir hata oluştu.'}</Alert>;
  }

  if (!canView) {
    return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;
  }

  if (!invoice) {
    return <Alert severity="warning">Fatura bulunamadı.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <AppBreadcrumbs />
      <PageHeader title={`Fatura Detayı: #${invoice.invoiceNumber}`} />
      <Card>
        <CardHeader title="Fatura Bilgileri" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {/* --- DOĞRU GRID KULLANIMI --- */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Müşteri Bilgileri</Typography>
              {customer ? (
                <Stack spacing={1}>
                  <Typography variant="body2"><strong>Adı Soyadı:</strong> {customer.firstName} {customer.lastName}</Typography>
                  <Typography variant="body2"><strong>Firma Adı:</strong> {customer.companyName || '-'}</Typography>
                  <Typography variant="body2"><strong>E-posta:</strong> {customer.email}</Typography>
                  <Typography variant="body2"><strong>Telefon:</strong> {customer.phone}</Typography>
                  <Typography variant="body2"><strong>Adres:</strong> {customer.address}</Typography>
                </Stack>
              ) : (
                <Typography variant="body2" color="error">Müşteri bilgisi yüklenemedi.</Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Fatura Detayları</Typography>
              <Stack spacing={1}>
                <Typography variant="body2"><strong>Fatura Tarihi:</strong> {dayjs(invoice.issueDate).format('DD.MM.YYYY')}</Typography>
                <Typography variant="body2"><strong>Vade Tarihi:</strong> {dayjs(invoice.dueDate).format('DD.MM.YYYY')}</Typography>
                <Typography variant="body2"><strong>Durum:</strong> {invoice.status}</Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Toplam Tutar: {invoice.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box sx={{ overflowX: 'auto' }}>
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
      </Card>
    </Stack>
  );
}