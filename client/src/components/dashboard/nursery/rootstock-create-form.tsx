'use client';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
// DÜZELTME 1: Rootstock tipi import edildi
import type { Rootstock, RootstockCreate } from '@/types/nursery';

const schema = zod.object({ name: zod.string().min(1, { message: 'Anaç adı gereklidir.' }) });

interface RootstockCreateFormProps {
  open: boolean;
  onClose: () => void;
  // DÜZELTME 2: onSuccess prop'u güncellendi
  onSuccess: (newRootstock: Rootstock) => void | Promise<void>;
}

export function RootstockCreateForm({ open, onClose, onSuccess }: RootstockCreateFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RootstockCreate>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  React.useEffect(() => { if (!open) { reset(); setFormError(null); } }, [open, reset]);

  const onSubmit = React.useCallback(async (values: RootstockCreate): Promise<void> => {
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum tokenı bulunamadı.');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rootstocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kayıt başarısız.');
      }
      
      // DÜZELTME 3: Yeni veri alınıp onSuccess ile geri gönderildi
      const newRootstock = await response.json();
      onSuccess(newRootstock);

    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    }
  }, [onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Anaç Ekle</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Controller name="name" control={control} render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.name)}>
                  <InputLabel required>Anaç Adı</InputLabel>
                  <OutlinedInput {...field} label="Anaç Adı" />
                  {errors.name && <FormHelperText>{errors.name.message}</FormHelperText>}
                </FormControl>
              )} />
              {formError && <Alert severity="error">{formError}</Alert>}
            </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>İptal</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>Oluştur</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}