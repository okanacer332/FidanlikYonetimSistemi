// client/src/components/dashboard/nursery/land-create-form.tsx
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

// LandCreate için bir schema tanımlayın
const schema = zod.object({
  name: zod.string().min(1, { message: 'Arazi adı gereklidir.' }),
  location: zod.string().min(1, { message: 'Arazi konumu gereklidir.' }),
});

// Form değerleri tipi
type LandCreateFormValues = zod.infer<typeof schema>;

interface LandCreateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LandCreateForm({ open, onClose, onSuccess }: LandCreateFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LandCreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', location: '' },
  });

  React.useEffect(() => {
    if (!open) {
      reset();
      setFormError(null);
    }
  }, [open, reset]);

  const onSubmit = React.useCallback(async (values: LandCreateFormValues): Promise<void> => {
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum tokenı bulunamadı.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/lands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kayıt başarısız.');
      }
      onSuccess(); // Başarılı olduğunda ana formu bilgilendir.
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    }
  }, [onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Arazi Ekle</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.name)}>
                    <InputLabel required>Arazi Adı</InputLabel>
                    <OutlinedInput {...field} label="Arazi Adı" />
                    {errors.name && <FormHelperText>{errors.name.message}</FormHelperText>}
                  </FormControl>
                )}
              />
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.location)}>
                    <InputLabel required>Konum</InputLabel>
                    <OutlinedInput {...field} label="Konum" />
                    {errors.location && <FormHelperText>{errors.location.message}</FormHelperText>}
                  </FormControl>
                )}
              />
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