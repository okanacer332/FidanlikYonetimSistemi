'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Stack, Typography, CircularProgress, Alert, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

import type { Customer } from '@/types/nursery';
import { useUser } from '@/hooks/use-user';
import { paths } from '@/paths';

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const router = useRouter();
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

  React.useEffect(() => {
    const fetchCustomers = async () => {
      if (!canView) {
        setError('Bu sayfayı görüntüleme yetkiniz yok.');
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum bulunamadı.');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Müşteriler yüklenemedi.');

        setCustomers(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [canView]);

  if (loading) {
    return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Cari Hesaplar (Müşteri)</Typography>
      
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell>Müşteri Adı</TableCell>
                <TableCell>Şirket Adı</TableCell>
                <TableCell>E-posta</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow hover key={customer.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{customer.firstName} {customer.lastName}</Typography>
                  </TableCell>
                  <TableCell>{customer.companyName || '-'}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => router.push(`${paths.dashboard.accounting.currentAccounts}/${customer.id}`)}
                    >
                      Ekstreyi Görüntüle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Card>
      {/* TODO: Tedarikçi cari hesapları için benzer bir yapı kurulacak. */}
    </Stack>
  );
}