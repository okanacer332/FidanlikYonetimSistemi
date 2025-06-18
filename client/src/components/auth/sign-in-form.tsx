// Konum: client/src/components/auth/sign-in-form.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
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
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
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
    <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
      {/* Küçük ekranlar için logo */}
      <Box sx={{
          display: { xs: 'flex', lg: 'none' }, // LG (büyük) ekranlarda gizle, XS (küçük) ekranlarda göster
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          pt: { xs: 2, sm: 3 },
          pb: { xs: 0, sm: 0 },
      }}>
          <Box
            component="img"
            alt="FidanFYS Logo"
            src="/assets/acrtech-fidanfys-logo.png"
            sx={{
              height: { xs: '120px', sm: '150px' },
              width: 'auto',
              maxWidth: { xs: '80%', sm: '70%' },
              objectFit: 'contain',
            }}
          />
      </Box>

      {/* Başlık */}
      <Typography variant="h5" sx={{ mt: { xs: 0, sm: 0 }, mb: { xs: 1, sm: 2 } }}>
          Giriş Yap
      </Typography>

      {/* Giriş Formu */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
        <Stack spacing={2}>
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
          
          {/* Hata Mesajları */}
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          {loginError ? <Alert color="error">{loginError}</Alert> : null}
          
          {/* Giriş Butonu */}
          <Button disabled={isPending} type="submit" variant="contained">
            Giriş Yap
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}