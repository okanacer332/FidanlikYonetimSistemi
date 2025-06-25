'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Stack, Typography, CircularProgress, Alert, Breadcrumbs, Link, Button, Box } from '@mui/material';
import NextLink from 'next/link';
import { Plus as PlusIcon } from '@phosphor-icons/react';

import type { Transaction, Supplier } from '@/types/nursery';
import { useUser } from '@/hooks/use-user';
import { paths } from '@/paths';
import { TransactionTable } from '@/components/dashboard/accounting/transaction-table';
import { TediyeCreateForm } from '@/components/dashboard/accounting/tediye-create-form';

export default function Page(): React.JSX.Element {
  const params = useParams();
  const supplierId = params.supplierId as string | undefined;

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [supplier, setSupplier] = React.useState<Supplier | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleSuccess = React.useCallback(async () => {
    setIsModalOpen(false);
    if (supplierId) {
      // Sadece işlem listesini yenile
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum bulunamadı.');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/accounting/suppliers/${supplierId}/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('İşlemler yenilenemedi.');
        setTransactions(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      }
    }
  }, [supplierId]);

  React.useEffect(() => {
    if (!supplierId) {
      setLoading(false);
      setError("URL'den tedarikçi kimliği okunamadı.");
      return;
    }

    const fetchDataForSupplier = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum bulunamadı.');

        const [transactionsRes, supplierRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/accounting/suppliers/${supplierId}/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers/${supplierId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!transactionsRes.ok) throw new Error('İşlem verileri yüklenemedi.');
        if (!supplierRes.ok) throw new Error('Tedarikçi bilgisi yüklenemedi.');
        
        setTransactions(await transactionsRes.json());
        setSupplier(await supplierRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchDataForSupplier();
  }, [supplierId]);

  if (loading) return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <TediyeCreateForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        suppliers={supplier ? [supplier] : []}
        preselectedSupplierId={supplierId}
      />
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Breadcrumbs separator=">">
    <Link component={NextLink} href={paths.dashboard.accounting.suppliers}>
        Tedarikçi Hesapları
    </Link>
    <Typography>Tedarikçi Ekstresi</Typography>
</Breadcrumbs>
            <Typography variant="h4" sx={{ mt: 1 }}>
                {supplier ? supplier.name : 'Tedarikçi Bilgisi Yükleniyor...'}
            </Typography>
          </Box>
          <Button
            startIcon={<PlusIcon />}
            variant="contained"
            onClick={() => setIsModalOpen(true)}
            disabled={!supplier}
          >
            Tediye Ekle
          </Button>
        </Stack>
        <TransactionTable transactions={transactions} />
      </Stack>
    </>
  );
}