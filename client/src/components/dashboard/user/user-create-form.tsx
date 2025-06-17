// client/src/components/dashboard/user/user-create-form.tsx
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import type { Role, UserCreateFormValues } from '@/types/user';
import { useUser } from '@/hooks/use-user';

// Form validasyon şeması
const schema = zod.object({
  username: zod.string().min(1, { message: 'Kullanıcı adı gereklidir' }),
  email: zod.string().min(1, { message: 'E-posta gereklidir' }).email('Geçerli bir e-posta adresi girin'),
  password: zod.string().min(6, { message: 'Şifre en az 6 karakter olmalıdır' }),
  roleIds: zod.array(zod.string()).min(1, { message: 'En az bir rol seçilmelidir' }),
});

interface UserCreateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserCreateForm({ open, onClose, onSuccess }: UserCreateFormProps): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [loadingRoles, setLoadingRoles] = React.useState<boolean>(true);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isSelectOpen, setIsSelectOpen] = React.useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserCreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', email: '', password: '', roleIds: [] },
  });

  // Rolleri backend'den çekme efekti
  React.useEffect(() => {
    const fetchRoles = async () => {
      if (!open) return;
      
      setLoadingRoles(true);
      setFormError(null);
      
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Oturum tokenı bulunamadı. Lütfen tekrar giriş yapın.');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/roles`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Roller alınırken bir sunucu hatası oluştu.' }));
          throw new Error(errorData.message || 'Roller alınamadı.');
        }
        
        const data: Role[] = await response.json();
        setRoles(data);
      } catch (err) {
        console.error('Rolleri çekerken hata:', err);
        setFormError(err instanceof Error ? err.message : 'Rolleri çekerken bir ağ hatası oluştu.');
        setRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();

    // Form kapandığında state'i sıfırla
    return () => {
      if (!open) {
        reset({ username: '', email: '', password: '', roleIds: [] });
        setFormError(null);
      }
    };
  }, [open, reset]);

  // Form gönderim fonksiyonu
  const onSubmit = React.useCallback(
    async (values: UserCreateFormValues): Promise<void> => {
      setIsSubmitting(true);
      setFormError(null);

      try {
        const token = localStorage.getItem('authToken');
        if (!token || !currentUser?.tenantId) {
          setFormError('Yetkilendirme bilgileri eksik. Lütfen tekrar giriş yapın.');
          setIsSubmitting(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Kullanıcı oluşturulurken bir sunucu hatası oluştu.' }));
          if (response.status === 409) {
            throw new Error('Bu kullanıcı adı veya e-posta zaten kullanılıyor.');
          }
          throw new Error(errorData.message || 'Kullanıcı oluşturulamadı.');
        }

        onSuccess();
        onClose();
      } catch (err) {
        console.error('Kullanıcı oluşturma hatası:', err);
        setFormError(err instanceof Error ? err.message : 'Bir ağ hatası oluştu.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentUser, onSuccess, onClose]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.username)}>
                  <InputLabel>Kullanıcı Adı</InputLabel>
                  <OutlinedInput {...field} label="Kullanıcı Adı" />
                  {errors.username ? <FormHelperText>{errors.username.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.email)}>
                  <InputLabel>E-posta</InputLabel>
                  <OutlinedInput {...field} label="E-posta" type="email" />
                  {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.password)}>
                  <InputLabel>Şifre</InputLabel>
                  <OutlinedInput {...field} label="Şifre" type="password" />
                  {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            <Controller
              name="roleIds"
              control={control}
              render={({ field }) => {
                // Değerin her zaman bir dizi olduğundan emin oluyoruz.
                const selectedValue = (field.value === undefined || field.value === null) ? [] : field.value as string[];
                return (
                  <FormControl fullWidth error={Boolean(errors.roleIds)}>
                    <InputLabel>Roller</InputLabel>
                    <Select
                      multiple
                      label="Roller"
                      disabled={loadingRoles || roles.length === 0}
                      value={selectedValue}
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      onChange={(event: SelectChangeEvent<string[]>) => {
                        field.onChange(event.target.value);
                        setIsSelectOpen(false);
                      }}
                      renderValue={(selected) => (selected as string[]).map((id) => roles.find((r) => r.id === id)?.name).join(', ')}
                      open={isSelectOpen}
                      onClose={() => setIsSelectOpen(false)}
                      onOpen={() => setIsSelectOpen(true)}
                    >
                      {loadingRoles ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} /> Yükleniyor...
                        </MenuItem>
                      ) : roles.length === 0 ? (
                        <MenuItem disabled>Rol bulunamadı.</MenuItem>
                      ) : (
                        roles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.roleIds ? <FormHelperText>{errors.roleIds.message}</FormHelperText> : null}
                  </FormControl>
                );
              }}
            />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            İptal
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Oluştur'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
