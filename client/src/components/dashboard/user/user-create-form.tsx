// client/src/components/dashboard/user/user-create-form.tsx
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

  const onSubmit = React.useCallback(
    async (values: UserCreateFormValues): Promise<void> => {
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: values.username,
            email: values.email,
            password: values.password,
            roleIds: values.roleIds,
          }),
        });

        // --- Hata Yanıtı İşleme Değişikliği Başlangıcı ---
        if (!response.ok) {
          let errorMessage = 'Kullanıcı oluşturulurken bir hata oluştu.';
          try {
            // Yanıtın Content-Type başlığını kontrol et, JSON ise parse etmeye çalış
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } else {
              // JSON olmayan veya boş yanıtlar için statusText kullan
              errorMessage = response.statusText || errorMessage;
            }
          } catch (jsonParseError) {
            // JSON ayrıştırma hatası durumunda (örneğin boş yanıt gövdesi)
            console.error("Hata yanıtı JSON ayrıştırma hatası:", jsonParseError);
            errorMessage = response.statusText || 'Beklenmedik sunucu yanıtı.';
          }

          if (response.status === 409) {
            setFormError('Bu kullanıcı adı veya e-posta zaten kullanılıyor.');
          } else if (response.status === 401 || response.status === 403) {
            setFormError('Bu işlemi yapmaya yetkiniz yok veya oturumunuz sona ermiş.');
          } else {
            setFormError(errorMessage);
          }
          return;
        }
        // --- Hata Yanıtı İşleme Değişikliği Sonu ---
        
        // Başarılı yanıtı JSON olarak ayrıştır
        const data = await response.json();

        // Başarılı olursa formu sıfırla ve callback'i çağır
        reset();
        onSuccess();
        onClose();

      } catch (err) {
        console.error('Kullanıcı oluşturma hatası:', err);
        setFormError('Kullanıcı oluşturulurken bir ağ hatası oluştu.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentUser, onSuccess, onClose, reset]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
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
                  <InputLabel>Şifre</InputLabel>
                  <OutlinedInput {...field} label="Şifre" type="password" />
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
                  <Select<string[]> // Select bileşenini string dizisi alacak şekilde tiplendiriyoruz
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
                      field.onChange(event.target.value); // event.target.value'u doğrudan field.onChange'e gönderiyoruz
                      setIsSelectOpen(false); // Seçim yapıldıktan sonra dropdown'ı manuel olarak kapat
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
          {isSubmitting ? <CircularProgress size={24} /> : 'Oluştur'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}