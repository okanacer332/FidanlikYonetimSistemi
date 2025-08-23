// client/src/components/dashboard/user/user-create-form.tsx
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { useNotifier } from '@/hooks/useNotifier';
import { useApiSWR } from '@/hooks/use-api-swr';
import { createUser } from '@/services/userService';
import type { Role, UserCreateFormValues } from '@/types/user';

const schema = zod.object({
  username: zod.string().min(1, { message: 'Kullanıcı adı gereklidir' }),
  email: zod.string().min(1, { message: 'E-posta gereklidir' }).email('Geçerli bir e-posta adresi girin'),
  password: zod.string().min(6, { message: 'Şifre en az 6 karakter olmalıdır' }),
  roleIds: zod.array(zod.string()).min(1, { message: 'En az bir rol seçilmelidir' }),
});

interface UserCreateFormProps {
  onSuccess: (newUserId: string) => void;
  onCancel: () => void;
}

const roleTranslations: Record<string, string> = {
  'ADMIN': 'Yönetici',
  'SALES': 'Satış',
  'ACCOUNTANT': 'Muhasebeci',
  'WAREHOUSE_STAFF': 'Depo Personeli',
};

export function UserCreateForm({ onSuccess, onCancel }: UserCreateFormProps): React.JSX.Element {
  const notify = useNotifier();
  const { data: roles, isLoading: isLoadingRoles, error: rolesError } = useApiSWR<Role[]>('/roles');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserCreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', email: '', password: '', roleIds: [] },
  });

  const onSubmit = React.useCallback(
    async (values: UserCreateFormValues): Promise<void> => {
      try {
        const newUser = await createUser(values);
        notify.success('Kullanıcı başarıyla oluşturuldu.');
        reset();
        onSuccess(newUser.id);
      } catch (err) {
        notify.error(err instanceof Error ? err.message : 'Bir hata oluştu.');
      }
    },
    [onSuccess, reset, notify]
  );
  
  if (isLoadingRoles) {
    return <Stack alignItems="center"><CircularProgress /></Stack>;
  }

  if (rolesError) {
    return <Alert severity="error">{rolesError.message}</Alert>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller name="username" control={control} render={({ field }) => ( <TextField {...field} label="Kullanıcı Adı" fullWidth size="small" required error={Boolean(errors.username)} helperText={errors.username?.message} /> )} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller name="email" control={control} render={({ field }) => ( <TextField {...field} label="E-posta" fullWidth size="small" required type="email" error={Boolean(errors.email)} helperText={errors.email?.message} /> )} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller name="password" control={control} render={({ field }) => ( <TextField {...field} label="Şifre" fullWidth size="small" required type="password" error={Boolean(errors.password)} helperText={errors.password?.message} /> )} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="roleIds"
            control={control}
            render={({ field }) => {
              const selectedValue = field.value === undefined || field.value === null ? [] : (field.value as string[]);
              return (
                <FormControl fullWidth error={Boolean(errors.roleIds)} size="small">
                  <InputLabel>Roller</InputLabel>
                  <Select<string[]>
                    multiple
                    label="Roller"
                    value={selectedValue}
                    onChange={(event: SelectChangeEvent<string[]>) => field.onChange(event.target.value)}
                    renderValue={(selected) =>
                      selected
                        .map((id) => {
                          const roleName = roles?.find((r) => r.id === id)?.name;
                          return roleName ? roleTranslations[roleName] || roleName : null;
                        })
                        .filter(Boolean)
                        .join(', ')
                    }
                  >
                    {roles?.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        <Checkbox checked={selectedValue.includes(role.id)} />
                        <ListItemText primary={roleTranslations[role.name] || role.name} />
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.roleIds ? <FormHelperText>{errors.roleIds.message}</FormHelperText> : null}
                </FormControl>
              );
            }}
          />
        </Grid>
      </Grid>
      <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{mt: 2}}>
        <Button onClick={onCancel} disabled={isSubmitting} color="secondary">İptal</Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} /> : 'Oluştur'}
        </Button>
      </Stack>
    </form>
  );
}