'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import {
  Alert, Button, Card, CardActions, CardContent, CardHeader, Divider, FormControl, Grid, 
  InputLabel, OutlinedInput, Stack, FormHelperText, CircularProgress
} from '@mui/material';

import { useUser } from '@/hooks/use-user';
import { authClient } from '@/lib/auth/client';
import { paths } from '@/paths';

const schema = zod.object({
    email: zod.string().min(1, { message: 'E-posta gereklidir.' }).email('Geçerli bir e-posta adresi girin.'),
    password: zod.string().min(6, 'Şifre en az 6 karakter olmalıdır.').optional().or(zod.literal('')),
    confirmPassword: zod.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor.',
    path: ['confirmPassword'],
  })
  .refine((data) => !data.password || data.password.length >= 6, {
      message: 'Yeni şifre en az 6 karakter olmalıdır.',
      path: ['password'],
  });

type Values = zod.infer<typeof schema>;

export function AccountDetailsForm(): React.JSX.Element {
  const router = useRouter();
  const { user, checkSession, signOut } = useUser();
  const [formMessage, setFormMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    defaultValues: { email: '', password: '', confirmPassword: '' },
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    if (user) {
      reset({ email: user.email, password: '', confirmPassword: '' });
    }
  }, [user, reset]);

  const onSubmit = React.useCallback(async (values: Values): Promise<void> => {
    setFormMessage(null);
    if (!user) {
      setFormMessage({ type: 'error', text: 'Kullanıcı bilgileri bulunamadı.' });
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("Oturum bulunamadı.");

      const isPasswordChange = values.password && values.password.length >= 6;

      const payload: any = {
        username: user.username,
        email: values.email,
        roleIds: user.roles?.map(r => r.id) || [],
        ...(isPasswordChange && { password: values.password }),
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Profil güncellenemedi.');
      }
      
      if (isPasswordChange) {
        // YENİ AKIŞ: Başarı mesajı göster ve 3 saniye sonra yönlendir.
        setFormMessage({ type: 'success', text: 'Şifre başarıyla güncellendi. 3 saniye içinde giriş sayfasına yönlendirileceksiniz...' });
        setTimeout(async () => {
            await signOut();
            router.push(paths.auth.signIn);
        }, 3000);
      } else {
        setFormMessage({ type: 'success', text: 'E-posta adresi başarıyla güncellendi.' });
        await checkSession();
      }
      
    } catch (err: any) {
      setFormMessage({ type: 'error', text: err.message });
    }
  }, [user, checkSession, signOut, router]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader subheader="Profil bilgilerinizi buradan güncelleyebilirsiniz" title="Profil Detayları" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ md: 6, xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Kullanıcı Adı</InputLabel>
                <OutlinedInput value={user?.username || ''} label="Kullanıcı Adı" disabled />
                <FormHelperText>Kullanıcı adı güvenlik nedeniyle değiştirilemez.</FormHelperText>
              </FormControl>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth required error={Boolean(errors.email)}>
                    <InputLabel>E-posta Adresi</InputLabel>
                    <OutlinedInput {...field} label="E-posta Adresi" type="email" />
                    {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
                <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.password)}>
                            <InputLabel>Yeni Şifre</InputLabel>
                            <OutlinedInput {...field} label="Yeni Şifre" type="password" />
                            {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : <FormHelperText>Değiştirmek istemiyorsanız boş bırakın.</FormHelperText>}
                        </FormControl>
                    )}
                />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
                <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.confirmPassword)}>
                            <InputLabel>Yeni Şifre (Tekrar)</InputLabel>
                            <OutlinedInput {...field} label="Yeni Şifre (Tekrar)" type="password" />
                            {errors.confirmPassword && <FormHelperText>{errors.confirmPassword.message}</FormHelperText>}
                        </FormControl>
                    )}
                />
            </Grid>
          </Grid>
          {formMessage && (
            <Alert severity={formMessage.type} sx={{ mt: 3 }}>
              {formMessage.text}
            </Alert>
          )}
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Değişiklikleri Kaydet'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}