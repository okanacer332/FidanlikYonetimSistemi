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
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { useMutation, gql } from '@apollo/client';

import { paths } from '@/paths';
import { useUser } from '@/hooks/use-user';

const LOGIN_MUTATION = gql`
  mutation GirisYap($kullaniciAdi: String!, $sifre: String!) {
    girisYap(kullaniciAdi: $kullaniciAdi, sifre: $sifre) {
      token
      kullanici {
        id
        kullaniciAdi
        email
        roller {
          id
          rolAdi
        }
      }
    }
  }
`;

const schema = zod.object({
  username: zod.string().min(1, { message: 'Kullanıcı adı gereklidir' }),
  password: zod.string().min(1, { message: 'Parola gereklidir' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { username: 'admin', password: 'admin' } satisfies Values;

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession } = useUser();
  const [showPassword, setShowPassword] = React.useState<boolean>();

  const [login, { loading: isPending, error: mutationError }] = useMutation(LOGIN_MUTATION);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      try {
        const { data } = await login({
          variables: {
            kullaniciAdi: values.username,
            sifre: values.password,
          },
        });

        if (data?.girisYap?.token) {
          localStorage.setItem('authToken', data.girisYap.token);
          await checkSession?.();
          router.refresh();
        }
      } catch (error) {
        if (error instanceof Error) {
          setError('root', { type: 'server', message: error.message });
        } else {
          setError('root', { type: 'server', message: 'Bilinmeyen bir hata oluştu.' });
        }
      }
    },
    [login, checkSession, router, setError]
  );

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Giriş Yap</Typography>
        <Typography color="text.secondary" variant="body2">
          Hesabınız yok mu?{' '}
          <Link component={RouterLink} href={paths.auth.signUp} underline="hover" variant="subtitle2">
            Kayıt Ol
          </Link>
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <FormControl error={Boolean(errors.username)}>
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
              <FormControl error={Boolean(errors.password)}>
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
            <Link component={RouterLink} href={paths.auth.resetPassword} variant="subtitle2">
              Parolanızı mı unuttunuz?
            </Link>
          </div>
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          {mutationError ? <Alert color="error">{mutationError.message}</Alert> : null}
          <Button disabled={isPending} type="submit" variant="contained">
            Giriş Yap
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}