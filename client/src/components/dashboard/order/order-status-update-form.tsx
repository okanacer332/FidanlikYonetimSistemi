'use client';

import * as React from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, FormControl,
  InputLabel, Select, MenuItem, Alert, CircularProgress, DialogContentText
} from '@mui/material';
import { OrderStatus } from '@/types/nursery';

interface OrderStatusUpdateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: string | null;
  currentStatus: OrderStatus | null;
}

// Bu harita artık hangi eylemin hangi endpoint'e gideceğini belirleyecek.
const actionMap: Record<string, { endpoint: string; label: string }> = {
    [OrderStatus.PREPARING]: { endpoint: 'ship', label: 'Sevk Et' },
    [OrderStatus.SHIPPED]: { endpoint: 'deliver', label: 'Teslim Et' },
};

// İptal etme her zaman ayrı bir eylem
const cancelAction = { endpoint: 'cancel', label: 'Siparişi İptal Et' };

export function OrderStatusUpdateForm({ open, onClose, onSuccess, orderId, currentStatus }: OrderStatusUpdateFormProps): React.JSX.Element {
  const [selectedAction, setSelectedAction] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const possibleActions = [];
  if (currentStatus && actionMap[currentStatus]) {
      possibleActions.push(actionMap[currentStatus]);
  }
  // Sipariş teslim edilmediyse iptal edilebilir
  if (currentStatus && currentStatus !== OrderStatus.DELIVERED) {
      possibleActions.push(cancelAction);
  }


  React.useEffect(() => {
    if (open) {
      setSelectedAction('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!orderId || !selectedAction) return;

    setIsSubmitting(true);
    setError(null);

    try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum bulunamadı.');
        
        // Seçilen aksiyona göre doğru endpoint'e POST isteği yap
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/${orderId}/${selectedAction}`, {
            method: 'POST',
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
      <DialogTitle>Sipariş İşlemi Seçin</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
            {possibleActions.length > 0 ? (
                <FormControl fullWidth>
                    <InputLabel>Yapılacak İşlem</InputLabel>
                    <Select
                        value={selectedAction}
                        label="Yapılacak İşlem"
                        onChange={(e) => setSelectedAction(e.target.value as string)}
                    >
                        {possibleActions.map(action => (
                            <MenuItem key={action.endpoint} value={action.endpoint}>{action.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : (
                <DialogContentText>Bu sipariş için yapılabilecek bir işlem bulunmuyor.</DialogContentText>
            )}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Vazgeç</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!selectedAction || isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Onayla'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}