'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert, Button, Box, FormControl, FormHelperText, InputLabel,
  OutlinedInput, Stack, Typography, CircularProgress
} from '@mui/material';
import { Eye as EyeIcon, EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

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
          // Hata mesajını doğrudan loginError state'ine atıyoruz
          if (authError.includes("Bu hesapta zaten aktif bir oturum bulunmaktadır")) {
            setLoginError("Bu hesapta zaten aktif bir oturum var. Başka bir oturum açmak için diğer oturumu sonlandırmalısınız.");
          } else {
            setLoginError(authError);
          }
          setIsPending(false);
          return;
        }

        if (data?.token) {
          await checkSession?.();
          router.refresh();
        } else {
          const errorMessage = 'Beklenmedik bir giriş hatası oluştu.';
          setLoginError(errorMessage);
        }
      } catch (error) {
        // Bu catch bloğu, authClient içinde fırlatılan bir `new Error(...)` hatasını yakalar.
        // Hatanın mesajını alıp loginError state'ine atarız.
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
        setLoginError(errorMessage);
      } finally {
        setIsPending(false);
      }
    },
    [checkSession, router]
  );

  return (
    <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
      <Box sx={{ display: { xs: 'flex', lg: 'none' }, width: '100%', justifyContent: 'center', alignItems: 'center', pt: { xs: 2, sm: 3 }, pb: { xs: 0, sm: 0 },}}>
          <Box component="img" alt="FidanFYS Logo" src="/assets/acrtech-fidanfys-logo.png" sx={{ height: { xs: '120px', sm: '150px' }, width: 'auto', maxWidth: { xs: '80%', sm: '70%' }, objectFit: 'contain' }}/>
      </Box>
      <Typography variant="h5" sx={{ mt: { xs: 0, sm: 0 }, mb: { xs: 1, sm: 2 } }}>
          Giriş Yap
      </Typography>

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
                <OutlinedInput {...field} endAdornment={ showPassword ? ( <EyeIcon cursor="pointer" fontSize="var(--icon-fontSize-md)" onClick={(): void => { setShowPassword(false); }} /> ) : ( <EyeSlashIcon cursor="pointer" fontSize="var(--icon-fontSize-md)" onClick={(): void => { setShowPassword(true); }} /> ) } label="Parola" type={showPassword ? 'text' : 'password'} />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />

          {/* HATA GÖSTERİMİ */}
          {(loginError || errors.root) && (
              <Alert color="error" severity="error">
                  {loginError || errors.root?.message}
              </Alert>
          )}

          <Button disabled={isPending} type="submit" variant="contained">
            {isPending ? <CircularProgress size={24} color="inherit" /> : 'Giriş Yap'}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}