'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useUser } from '@/hooks/use-user'; // useUser hook'unu import ediyoruz

export function AccountInfo(): React.JSX.Element {
  const { user } = useUser(); // Hook'tan kullanıcı verilerini alıyoruz

  const userRoles = user?.roles?.map(role => role.name).join(', ') || 'Belirtilmemiş';

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            {/* Kullanıcının adının baş harfi ile Avatar oluşturuyoruz */}
            <Avatar sx={{ height: '80px', width: '80px', fontSize: '2.5rem' }}>
              {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
            </Avatar>
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            {/* Dinamik kullanıcı adını gösteriyoruz */}
            <Typography variant="h5">{user?.username || 'Kullanıcı'}</Typography>
            {/* Dinamik e-posta ve rolleri gösteriyoruz */}
            <Typography color="text.secondary" variant="body2">
              {user?.email || 'E-posta adresi yok'}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Rol: {userRoles}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      {/* Bu kısım ihtiyaca göre yeniden düzenlenebilir, şimdilik kaldırıldı */}
      {/* <CardActions>
        <Button fullWidth variant="text">
          Resmi Güncelle
        </Button>
      </CardActions>
      */}
    </Card>
  );
}