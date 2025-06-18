// Konum: client/src/components/auth/sign-in-form.tsx
'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { useUser } from '@/hooks/use-user';
import { authClient } from '@/lib/auth/client';

const schema = zod.object({
  username: zod.string().min(1, { message: 'Kullanıcı adı gereklidir' }),
  password: zod.string().min(1, { message: 'Parola gereklidir' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { username: '', password: '' } satisfies Values;

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession } = useUser();
  const [showPassword, setShowPassword] = React.useState<boolean>();
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
      setLoginError(null);

      try {
        const { data, error: authError } = await authClient.signInWithPassword({
          username: values.username,
          password: values.password,
        });

        if (authError) {
          setError('root', { type: 'server', message: authError });
          setLoginError(authError);
          return;
        }

        if (data?.token) {
          await checkSession?.();
          router.refresh();
        } else {
          setError('root', { type: 'server', message: 'Beklenmedik bir giriş hatası oluştu.' });
          setLoginError('Beklenmedik bir giriş hatası oluştu.');
        }
      } catch (error) {
        if (error instanceof Error) {
          setError('root', { type: 'server', message: error.message });
          setLoginError(error.message);
        } else {
          setError('root', { type: 'server', message: 'Bilinmeyen bir hata oluştu.' });
          setLoginError('Bilinmeyen bir hata oluştu.');
        }
      } finally {
        setIsPending(false);
      }
    },
    [checkSession, router, setError]
  );

  return (
    <Stack spacing={1}>
      {/* Küçük ekranlar için logo */}
      <Box sx={{
          // md ve üzeri ekranlarda gizle, aksi takdirde flex (görünür)
          display: { md: 'none' },
          justifyContent: 'center', // Logoyu yatayda ortala
          mb: { xs: 2, sm: 3 }, // Telefon (xs) ve tablet (sm) ekranları için alt boşluk
      }}>
          <Box
            component="img"
            alt="FidanFYS Logo"
            src="/assets/acrtech-fidanfys-logo.png"
            sx={{
              height: { xs: '100px', sm: '120px' }, // Telefon (xs) ve tablet (sm) için yükseklik
              width: 'auto',
              maxWidth: { xs: '250px', sm: '350px' }, // Telefon (xs) ve tablet (sm) için maksimum genişlik
            }}
          />
      </Box>

      <Stack spacing={0.5}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
            Giriş Yap
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={1}>
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.username)}>
                <InputLabel>Kullanıcı Adı</InputLabel>
                <OutlinedInput {...field} label="Kullanıcı Adı" />
                {errors.username ? <FormHelperText>{errors.username.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.password)}>
                <InputLabel>Parola</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(false);
                        }}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(true);
                        }}
                      />
                    )
                  }
                  label="Parola"
                  type={showPassword ? 'text' : 'password'}
                />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <div>
            <Tooltip title="Lütfen AcrTech Ceo Okan Acer'i arayın (0 536 248 7703)" placement="top">
              <Typography variant="subtitle2" sx={{ cursor: 'default' }}>
                Parolanızı mı unuttunuz?
              </Typography>
            </Tooltip>
          </div>
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          {loginError ? <Alert color="error">{loginError}</Alert> : null}
          <Button disabled={isPending} type="submit" variant="contained">
            Giriş Yap
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}