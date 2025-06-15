// client/src/components/dashboard/user/user-edit-form.tsx
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
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import type { Role, User as UserType } from '@/types/user';
import { useUser } from '@/hooks/use-user';

// Form validasyon şeması (password alanı opsiyonel olacak düzenlemede)
const schema = zod.object({
  id: zod.string().min(1), // Kullanıcı ID'si
  username: zod.string().min(1, { message: 'Kullanıcı adı gereklidir' }),
  email: zod.string().min(1, { message: 'E-posta gereklidir' }).email('Geçerli bir e-posta adresi girin'),
  password: zod.string().optional(), // Şifre düzenlemede opsiyonel
  roleIds: zod.array(zod.string()).min(1, { message: 'En az bir rol seçilmelidir' }),
});

// Güncelleme için gönderilecek veri tipi
export interface UserUpdateFormValues extends zod.infer<typeof schema> {
  // `id` zaten schema'da var
}

interface UserEditFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: UserType | null; // Düzenlenecek kullanıcı
}

export function UserEditForm({ open, onClose, onSuccess, user }: UserEditFormProps): React.JSX.Element {
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
    setValue,
    formState: { errors },
  } = useForm<UserUpdateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { id: '', username: '', email: '', password: '', roleIds: [] },
  });

  // Rolleri backend'den çekme
  React.useEffect(() => {
    const fetchRoles = async () => {
      if (!currentUser || !currentUser.tenantId) {
        setFormError('Kullanıcı veya şirket bilgisi bulunamadı.');
        setLoadingRoles(false);
        return;
      }

      setLoadingRoles(true);
      setFormError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setFormError('Oturum tokenı bulunamadı.');
          setLoadingRoles(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/roles`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setFormError(data.message || 'Roller alınamadı.');
          setRoles([]);
          return;
        }
        setRoles(data);
      } catch (err) {
        console.error('Rolleri çekerken hata:', err);
        setFormError('Rolleri çekerken bir ağ hatası oluştu.');
        setRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    };

    if (open) {
      fetchRoles();
    }
  }, [open, currentUser]);

  // `user` prop'u değiştiğinde formu doldur
  React.useEffect(() => {
    // Console logları hata ayıklama için bırakılabilir, testten sonra kaldırılabilir
    console.log('UserEditForm useEffect triggered. Current user prop in useEffect:', user);
    if (user) {
      console.log('User object in useEffect is defined. user.username:', user.username); // Düzeltildi
      reset({
        id: user.id,
        username: user.username, // Düzeltme: user.kullaniciAdi yerine user.username
        email: user.email,
        password: '',
        roleIds: user.roles?.map(role => role.id) || [],
      });
    } else {
      console.log('User object in useEffect is null or undefined.');
      reset({ id: '', username: '', email: '', password: '', roleIds: [] });
    }
    setFormError(null);
  }, [user, reset]);


  const onSubmit = React.useCallback(
    async (values: UserUpdateFormValues): Promise<void> => {
      setIsSubmitting(true);
      setFormError(null);

      if (!currentUser || !currentUser.tenantId) {
        setFormError('Oturum açmış kullanıcıya ait şirket bilgisi bulunamadı.');
        setIsSubmitting(false);
        return;
      }

      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setFormError('Oturum tokenı bulunamadı.');
          setIsSubmitting(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${values.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: values.username,
            email: values.email,
            password: values.password || undefined,
            roleIds: values.roleIds,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 409) {
            setFormError('Bu kullanıcı adı veya e-posta zaten kullanılıyor.');
          } else if (response.status === 403) {
            setFormError('Bu işlemi yapmaya yetkiniz yok.');
          } else if (response.status === 404) {
            setFormError('Kullanıcı bulunamadı.');
          }
          else {
            setFormError(data.message || 'Kullanıcı güncellenirken bir hata oluştu.');
          }
          return;
        }

        onSuccess();
        onClose();
        reset();

      } catch (err) {
        console.error('Kullanıcı güncelleme hatası:', err);
        setFormError('Kullanıcı güncellenirken bir ağ hatası oluştu.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentUser, onSuccess, onClose, reset]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Kullanıcı Bilgilerini Düzenle</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
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
                  <InputLabel>Yeni Şifre (Boş bırakırsanız değişmez)</InputLabel>
                  <OutlinedInput {...field} label="Yeni Şifre" type="password" />
                  {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            <Controller
              name="roleIds"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.roleIds)}>
                  <InputLabel>Roller</InputLabel>
                  <Select
                    {...field}
                    multiple
                    label="Roller"
                    disabled={loadingRoles || roles.length === 0}
                    value={field.value || []}
                    renderValue={(selected) => (selected as string[]).map(id => roles.find(r => r.id === id)?.name).join(', ')}
                    open={isSelectOpen}
                    onClose={() => setIsSelectOpen(false)}
                    onOpen={() => setIsSelectOpen(true)}
                    onChange={(event: SelectChangeEvent<string[]>) => {
                      field.onChange(event);
                      setIsSelectOpen(false);
                    }}
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
              )}
            />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>İptal</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} /> : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}