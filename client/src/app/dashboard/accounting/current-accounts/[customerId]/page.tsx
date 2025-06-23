'use client';

import * as React from 'react';
import { useParams } from 'next/navigation'; // Next.js'in modern hook'unu import ediyoruz
import { Stack, Typography, CircularProgress, Alert, Breadcrumbs, Link, Button, Box } from '@mui/material';
import NextLink from 'next/link';
import { Plus as PlusIcon } from '@phosphor-icons/react';

import type { Transaction, Customer } from '@/types/nursery';
import { useUser } from '@/hooks/use-user';
import { paths } from '@/paths';
import { TransactionTable } from '@/components/dashboard/accounting/transaction-table';
import { CollectionCreateForm } from '@/components/dashboard/accounting/collection-create-form';

// Artık props üzerinden params almaya gerek kalmadı
export default function Page(): React.JSX.Element {
  // URL parametresini doğrudan hook ile alıyoruz
  const params = useParams();
  const customerId = params.customerId as string | undefined;

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Tahsilat sonrası sadece işlem listesini yenileyen fonksiyon
  const handleSuccess = React.useCallback(async () => {
    setIsModalOpen(false);
    if (customerId) {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/accounting/customers/${customerId}/transactions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const errorBody = await res.json().catch(() => null);
                throw new Error(`İşlemler yenilenemedi: ${errorBody?.message || res.statusText}`);
            }
            setTransactions(await res.json());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
        }
    }
  }, [customerId]);

  React.useEffect(() => {
    // customerId'nin varlığından emin olmadan işlemi başlatma
    if (!customerId) {
      setLoading(false);
      setError("URL'den müşteri kimliği okunamadı.");
      return;
    }

    const fetchDataForCustomer = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
        }

        const [transactionsRes, customerRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/accounting/customers/${customerId}/transactions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers/${customerId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Hata kontrolünü json parse etmeden önce yapıyoruz
        if (!transactionsRes.ok) {
          const errorBody = await transactionsRes.json().catch(() => ({ message: 'Sunucu yanıtı okunamadı.' }));
          throw new Error(`İşlem verileri yüklenemedi: ${errorBody.message || transactionsRes.statusText}`);
        }
        if (!customerRes.ok) {
          const errorBody = await customerRes.json().catch(() => ({ message: 'Sunucu yanıtı okunamadı.' }));
          throw new Error(`Müşteri bilgisi yüklenemedi: ${errorBody.message || customerRes.statusText}`);
        }
        
        // Verileri state'e ata
        setTransactions(await transactionsRes.json());
        setCustomer(await customerRes.json());

      } catch (err) {
        console.error("Cari ekstre veri çekme hatası:", err); 
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchDataForCustomer();

  }, [customerId]);


  if (loading) {
    return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <CollectionCreateForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        customers={customer ? [customer] : []}
        preselectedCustomerId={customerId}
      />
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Breadcrumbs separator=">">
                <Link component={NextLink} href={paths.dashboard.accounting.currentAccounts}>
                    Cari Hesaplar
                </Link>
                <Typography>Müşteri Ekstresi</Typography>
            </Breadcrumbs>
            <Typography variant="h4" sx={{ mt: 1 }}>
                {customer ? `${customer.firstName} ${customer.lastName}` : 'Müşteri Bilgisi Yükleniyor...'}
            </Typography>
          </Box>
          <Button
            startIcon={<PlusIcon />}
            variant="contained"
            onClick={() => setIsModalOpen(true)}
            disabled={!customer} // Müşteri verisi gelmeden butonu aktif etme
          >
            Tahsilat Ekle
          </Button>
        </Stack>
      
        <TransactionTable transactions={transactions} />
      </Stack>
    </>
  );
}
