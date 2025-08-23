// client/src/components/dashboard/user/user-edit-form.tsx
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
import { useApiSWR } from '@/hooks/use-api-swr';
import { updateUser } from '@/services/userService';
import type { Role, User as UserType, UserUpdateFormValues } from '@/types/user';

// Yeni Zod şeması
const schema = zod.object({
    username: zod.string().min(1, 'Kullanıcı adı gereklidir.'),
    email: zod.string().email('Geçerli bir e-posta adresi girin.'),
    password: zod.string().optional()
        .refine(val => !val || val.length >= 6, {
            message: 'Yeni şifre en az 6 karakter olmalıdır.',
        }),
    roleIds: zod.array(zod.string()).min(1, 'En az bir rol seçilmelidir.'),
});

type Values = zod.infer<typeof schema>;

interface UserEditFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: UserType | null;
}

// Türkçe rol çeviri haritası
const roleTranslations: Record<string, string> = {
  'ADMIN': 'Yönetici',
  'SALES': 'Satış',
  'ACCOUNTANT': 'Muhasebeci',
  'WAREHOUSE_STAFF': 'Depo Personeli',
};

export function UserEditForm({ open, onClose, onSuccess, user }: UserEditFormProps): React.JSX.Element {
    const { user: currentUser } = useUser();
    const { data: roles, isLoading: loadingRoles, error: rolesError } = useApiSWR<Role[]>('/roles');
    const [formError, setFormError] = React.useState<string | null>(null);

    const isCurrentUserAdmin = currentUser?.roles?.some(role => role.name === 'ADMIN');

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
        if (user) {
            reset(defaultValues);
        }
    }, [user, reset, defaultValues]);
    
    // Güncelleme isteğini düzenleme
    const onSubmit = async (values: Values): Promise<void> => {
    setFormError(null);
    if (!user) return;

    try {
        // payload objesini oluştururken password alanını koşullu olarak ekle
        const payload: {
            username: string;
            email: string;
            roleIds: string[];
            password?: string; // Optional olarak tanımla
        } = {
            username: values.username,
            email: values.email,
            roleIds: values.roleIds,
        };

        // Eğer parola doluysa payload'a ekle
        if (values.password && values.password.trim() !== '') {
            payload.password = values.password;
        }

        // `updateUser` servisini yeni payload ile çağır
        await updateUser(user.id, payload);
        
        onSuccess();
        onClose();
    } catch (err: any) {
        setFormError(err.message);
    }
};
    
    if (loadingRoles) {
      return <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth><DialogContent><Stack alignItems="center"><CircularProgress /></Stack></DialogContent></Dialog>;
    }
    
    if (rolesError) {
      return <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth><DialogContent><Alert severity="error">{rolesError.message}</Alert></DialogContent></Dialog>;
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Kullanıcı Bilgilerini Düzenle</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <Controller name="username" control={control} render={({ field }) => <TextField {...field} label="Kullanıcı Adı" error={Boolean(errors.username)} helperText={errors.username?.message} fullWidth />} />
                        <Controller name="email" control={control} render={({ field }) => <TextField {...field} label="E-posta" type="email" error={Boolean(errors.email)} helperText={errors.email?.message} fullWidth />} />
                        <Controller name="password" control={control} render={({ field }) => <TextField {...field} label="Yeni Şifre" type="password" error={Boolean(errors.password)} helperText={errors.password?.message || "Değiştirmek istemiyorsanız boş bırakın."} fullWidth />} />
                        <Controller
                            name="roleIds"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth error={Boolean(errors.roleIds)}>
                                    <InputLabel>Roller</InputLabel>
                                    <Select<string[]>
                                        multiple
                                        label="Roller"
                                        disabled={loadingRoles || !isCurrentUserAdmin}
                                        value={field.value}
                                        onChange={(event: SelectChangeEvent<string[]>) => field.onChange(event.target.value)}
                                        input={<OutlinedInput label="Roller" />}
                                        // Türkçe çeviri mantığı eklendi
                                        renderValue={(selected) =>
                                          selected.map(id => {
                                            const roleName = roles?.find(r => r.id === id)?.name;
                                            return roleName ? roleTranslations[roleName] || roleName : '';
                                          }).join(', ')
                                        }
                                    >
                                        {roles?.map((role) => (
                                            <MenuItem key={role.id} value={role.id}>
                                                <Checkbox checked={field.value.indexOf(role.id) > -1} />
                                                {/* Türkçe çeviri mantığı eklendi */}
                                                <ListItemText primary={roleTranslations[role.name] || role.name} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.roleIds && <FormHelperText>{errors.roleIds.message}</FormHelperText>}
                                    {!isCurrentUserAdmin && <FormHelperText>Rolleri sadece yöneticiler değiştirebilir.</FormHelperText>}
                                </FormControl>
                            )}
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