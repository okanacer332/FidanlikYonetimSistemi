// Dosya Yolu: client/src/components/dashboard/user/user-edit-form.tsx
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { useUser } from '@/hooks/use-user';

interface Role {
  id: string;
  name: string;
}

interface UserType {
  id: string;
  username: string;
  email: string;
  roles: Role[];
}

const schema = zod.object({
  username: zod.string().min(1, 'Kullanıcı adı gereklidir.'),
  email: zod.string().email('Geçerli bir e-posta adresi girin.'),
  password: zod.string().optional(),
  roleIds: zod.array(zod.string()).min(1, 'En az bir rol seçilmelidir.'),
});

type Values = zod.infer<typeof schema>;

interface UserEditFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: UserType | null;
}

export function UserEditForm({ open, onClose, onSuccess, user }: UserEditFormProps): React.JSX.Element {
  const { user: currentUser } = useUser(); // MEVCUT GİRİŞ YAPAN KULLANICIYI AL
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = React.useState(true);
  const [formError, setFormError] = React.useState<string | null>(null);

  // YETKİ KONTROLÜ: Mevcut kullanıcı yönetici mi?
  const isCurrentUserAdmin = currentUser?.roles?.some(role => role.name === 'Yönetici');

  const defaultValues = React.useMemo(() => ({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    roleIds: user?.roles?.map(role => role.id) || [],
  }), [user]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  React.useEffect(() => {
    async function fetchRoles() {
      try {
        setLoadingRoles(true);
        const response = await fetch('/api/v1/roles');
        if (!response.ok) throw new Error('Roller yüklenemedi.');
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error("Roller yüklenirken hata oluştu:", error);
      } finally {
        setLoadingRoles(false);
      }
    }
    fetchRoles();
  }, []);

  React.useEffect(() => {
    reset(defaultValues);
  }, [user, reset, defaultValues]);

  const onSubmit = async (values: Values): Promise<void> => {
    setFormError(null);
    try {
      const payload: any = {
        username: values.username,
        email: values.email,
        roleIds: values.roleIds,
      };

      if (values.password) {
        payload.password = values.password;
      }
      
      const response = await fetch(`/api/v1/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kullanıcı güncellenemedi.');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setFormError(err.message);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Kullanıcı Bilgilerini Düzenle</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Controller name="username" control={control} render={({ field }) => <TextField {...field} label="Kullanıcı Adı" error={Boolean(errors.username)} helperText={errors.username?.message} />} />
            <Controller name="email" control={control} render={({ field }) => <TextField {...field} label="E-posta" type="email" error={Boolean(errors.email)} helperText={errors.email?.message} />} />
            <Controller name="password" control={control} render={({ field }) => <TextField {...field} label="Yeni Şifre (isteğe bağlı)" type="password" error={Boolean(errors.password)} helperText={errors.password?.message} />} />
            <Controller
              name="roleIds"
              control={control}
              render={({ field }) => {
                const selectedValue = (field.value === undefined || field.value === null) ? [] : field.value as string[];
                return (
                  <FormControl fullWidth error={Boolean(errors.roleIds)}>
                    <InputLabel>Roller</InputLabel>
                    <Select<string[]>
                      multiple
                      label="Roller"
                      // DÜZELTME: Sadece yönetici ise rol seçimi aktif olsun
                      disabled={loadingRoles || roles.length === 0 || !isCurrentUserAdmin}
                      value={selectedValue}
                      onChange={(event: SelectChangeEvent<string[]>) => field.onChange(event.target.value)}
                      input={<OutlinedInput label="Roller" />}
                      renderValue={(selected) =>
                        roles.filter(r => selected.includes(r.id)).map(r => r.name).join(', ')
                      }
                    >
                      {loadingRoles ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} />
                        </MenuItem>
                      ) : (
                        roles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            <Checkbox checked={selectedValue.indexOf(role.id) > -1} />
                            <ListItemText primary={role.name} />
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.roleIds ? <FormHelperText>{errors.roleIds.message}</FormHelperText> : null}
                    {!isCurrentUserAdmin && <FormHelperText>Rolleri sadece yöneticiler değiştirebilir.</FormHelperText>}
                  </FormControl>
                );
              }}
            />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>İptal</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}