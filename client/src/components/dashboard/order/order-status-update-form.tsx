'use client';

import * as React from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, FormControl,
  InputLabel, Select, MenuItem, Alert, CircularProgress, DialogContentText
} from '@mui/material';
// GÜNCELLEME: Enum'ı bir değer olarak import ediyoruz, sadece tip olarak değil.
import { OrderStatus } from '@/types/nursery';

interface OrderStatusUpdateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: string | null;
  currentStatus: OrderStatus | null;
}

// GÜNCELLEME: String literaller yerine OrderStatus enum üyeleri kullanıldı.
const nextStatusMap: Record<string, { value: OrderStatus; label: string }[]> = {
    [OrderStatus.PREPARING]: [{ value: OrderStatus.SHIPPED, label: 'Sevk Edildi' }, { value: OrderStatus.CANCELED, label: 'İptal Et' }],
    [OrderStatus.SHIPPED]: [{ value: OrderStatus.DELIVERED, label: 'Teslim Edildi' }],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELED]: [],
};

export function OrderStatusUpdateForm({ open, onClose, onSuccess, orderId, currentStatus }: OrderStatusUpdateFormProps): React.JSX.Element {
  const [newStatus, setNewStatus] = React.useState<OrderStatus | ''>('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const possibleNextStatuses = currentStatus ? nextStatusMap[currentStatus] : [];

  React.useEffect(() => {
    if (open) {
      setNewStatus('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!orderId || !newStatus) return;

    setIsSubmitting(true);
    setError(null);

    try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum bulunamadı.');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/${orderId}/status/${newStatus}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Durum güncellenemedi.');
        }
        onSuccess();
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Sipariş Durumunu Güncelle</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
            {possibleNextStatuses.length > 0 ? (
                <FormControl fullWidth>
                    <InputLabel>Yeni Durum</InputLabel>
                    <Select
                        value={newStatus}
                        label="Yeni Durum"
                        onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    >
                        {possibleNextStatuses.map(status => (
                            <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : (
                <DialogContentText>Bu sipariş için durum güncellemesi yapılamaz.</DialogContentText>
            )}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Vazgeç</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!newStatus || isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Güncelle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}