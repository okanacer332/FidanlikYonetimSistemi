import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, CssBaseline, Alert } from '@mui/material';
import { useMutation, gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LOGIN_MUTATION = gql`
  mutation GirisYap($email: String!, $sifre: String!) {
    girisYap(email: $email, sifre: $sifre) {
      token
      kullanici {
        id
        email
        role {
          id
          name
          # İleride izinleri de isteyebiliriz: permissions { id action }
        }
      }
    }
  }
`;

const LoginPage = () => {
  const [formState, setFormState] = useState({ email: '', sifre: '' });
  const { login } = useAuth(); // AuthContext'ten login fonksiyonunu al
  const navigate = useNavigate(); // Yönlendirme için hook

  const [girisYap, { loading, error }] = useMutation(LOGIN_MUTATION, {
    onCompleted: ({ girisYap }) => {
      login(girisYap.kullanici, girisYap.token); // Context'i ve localStorage'ı güncelle
      navigate('/'); // Giriş başarılıysa ana sayfaya (dashboard'a) yönlendir
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    girisYap({ variables: { ...formState } });
  };

  return (
    <Container component="main" maxWidth="xs">
        {/* MUI Form Kodları Buraya Gelecek (Birazdan ekleyeceğiz) */}
        <CssBaseline />
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5">Giriş Yap</Typography>
            <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 1 }}>
                <TextField margin="normal" required fullWidth label="E-posta Adresi" name="email" value={formState.email} onChange={(e) => setFormState({ ...formState, email: e.target.value })} />
                <TextField margin="normal" required fullWidth name="password" label="Şifre" type="password" value={formState.sifre} onChange={(e) => setFormState({ ...formState, sifre: e.target.value })} />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</Button>
                {error && <Alert severity="error">{error.message}</Alert>}
            </Box>
        </Box>
    </Container>
  );
};

export default LoginPage;