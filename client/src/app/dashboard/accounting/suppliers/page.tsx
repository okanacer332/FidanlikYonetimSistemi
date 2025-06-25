'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Stack, Typography, CircularProgress, Alert, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

import type { Supplier } from '@/types/nursery';
import { useUser } from '@/hooks/use-user';
import { paths } from '@/paths';

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const router = useRouter();
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

  React.useEffect(() => {
    const fetchSuppliers = async () => {
      if (!canView) {
        setError('Bu sayfayı görüntüleme yetkiniz yok.');
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum bulunamadı.');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Tedarikçiler yüklenemedi.');

        setSuppliers(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) { // currentUser'ın yüklenmesini bekleyelim
        fetchSuppliers();
    }
  }, [canView, currentUser]);

  if (loading) {
    return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Cari Hesaplar (Tedarikçi)</Typography>
      
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell>Tedarikçi Adı</TableCell>
                <TableCell>Yetkili Kişi</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow hover key={supplier.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{supplier.name}</Typography>
                  </TableCell>
                  <TableCell>{supplier.contactPerson}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      // --- DÜZELTME BURADA ---
                      // "customer.id" yerine "supplier.id" kullanılıyor.
                      onClick={() => router.push(`${paths.dashboard.accounting.suppliers}/${supplier.id}`)}
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
    </Stack>
  );
}