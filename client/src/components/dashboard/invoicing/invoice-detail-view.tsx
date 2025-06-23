'use client';

import * as React from 'react';
import { Box, Button, Card, CardContent, CardHeader, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Download as DownloadIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';

import type { Invoice, Customer } from '@/types/nursery';
import { generateInvoicePdf } from '@/lib/pdf/generate-invoice-pdf';

interface InvoiceDetailViewProps {
  invoice: Invoice;
  customer: Customer;
}

// DÜZELTME: Fonksiyonun "varsayılan" olarak export edildiğinden emin olundu.
export default function InvoiceDetailView({ invoice, customer }: InvoiceDetailViewProps): React.JSX.Element {
    
    const handleDownloadPdf = () => {
        generateInvoicePdf(invoice, customer);
    };

    const subtotal = invoice.items.reduce((acc, item) => acc + item.totalPrice, 0);
    // KDV'yi %20 olarak varsayalım
    const taxRate = 0.20;
    const taxAmount = subtotal * taxRate;
    const grandTotal = subtotal + taxAmount;

  return (
    <Card>
      <CardHeader
        title={`Fatura #${invoice.invoiceNumber}`}
        action={
          <Button
            color="primary"
            startIcon={<DownloadIcon />}
            variant="contained"
            onClick={handleDownloadPdf}
          >
            PDF İndir
          </Button>
        }
      />
      <Divider />
      <CardContent>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 auto', minWidth: { xs: '100%', md: 'calc(50% - 12px)' } }}>
            <Typography variant="h6" gutterBottom>Fatura Bilgileri</Typography>
            <Typography variant="body2"><strong>Fatura Tarihi:</strong> {dayjs(invoice.issueDate).format('DD/MM/YYYY')}</Typography>
            <Typography variant="body2"><strong>Vade Tarihi:</strong> {dayjs(invoice.dueDate).format('DD/MM/YYYY')}</Typography>
            <Typography variant="body2"><strong>Sipariş No:</strong> {invoice.orderId}</Typography>
          </Box>
          <Box sx={{ flex: '1 1 auto', minWidth: { xs: '100%', md: 'calc(50% - 12px)' }, textAlign: { md: 'right' } }}>
            <Typography variant="h6" gutterBottom>Müşteri Bilgileri</Typography>
            <Typography variant="body1"><strong>{customer.firstName} {customer.lastName}</strong></Typography>
            <Typography variant="body2">{customer.companyName || ''}</Typography>
            <Typography variant="body2">{customer.address}</Typography>
            <Typography variant="body2">{customer.email}</Typography>
            <Typography variant="body2">{customer.phone}</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3, overflowX: 'auto' }}>
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

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Box>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Ara Toplam:</TableCell>
                            <TableCell align="right">{subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>KDV (%{taxRate * 100}):</TableCell>
                            <TableCell align="right">{taxAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Genel Toplam:</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {grandTotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
