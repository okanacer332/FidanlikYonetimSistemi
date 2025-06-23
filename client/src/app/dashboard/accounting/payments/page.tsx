'use client';

import * as React from 'react';
import { Stack, Typography, CircularProgress, Alert, Card, Box } from '@mui/material';

import { useUser } from '@/hooks/use-user';
import type { Payment, Customer, Supplier } from '@/types/nursery';
import { PaymentsTable, type PaymentRow } from '@/components/dashboard/accounting/payments-table';

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
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

        const [paymentsRes, customersRes, suppliersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!paymentsRes.ok || !customersRes.ok || !suppliersRes.ok) {
          throw new Error('Veriler yüklenirken bir hata oluştu.');
        }

        setPayments(await paymentsRes.json());
        setCustomers(await customersRes.json());
        setSuppliers(await suppliersRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [canView]);

  const preparedData = React.useMemo((): PaymentRow[] => {
    const customerMap = new Map(customers.map(c => [c.id, `${c.firstName} ${c.lastName}`]));
    // DÜZELTME: 'suppliers' dizisi üzerinde .map() fonksiyonu eklendi.
    const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));

    return payments.map(payment => {
        let relatedName = 'Bilinmiyor';
        if (payment.relatedEntityType === 'CUSTOMER') {
            relatedName = customerMap.get(payment.relatedId) || 'Bilinmeyen Müşteri';
        } else if (payment.relatedEntityType === 'SUPPLIER') {
            relatedName = supplierMap.get(payment.relatedId) || 'Bilinmeyen Tedarikçi';
        }
        return { ...payment, relatedName };
    });
  }, [payments, customers, suppliers]);

  if (loading) {
    return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Kasa & Banka Hareketleri</Typography>
      <PaymentsTable rows={preparedData} />
    </Stack>
  );
}
