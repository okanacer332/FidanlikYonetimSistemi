// Dosya Yolu: client/src/components/dashboard/customer/customer-create-inline.tsx
'use client';

import * as React from 'react';
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  TextField,
} from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';

// --- ÇÖZÜM: 'email' alanını zorunlu yapıyoruz ---
export interface CustomerFormValues {
  firstName: string;
  lastName: string;
  companyName?: string;
  phone: string;
  email: string; // 'email?: string' yerine 'email: string' olmalı
  address: string;
}

interface CustomerCreateInlineProps {
  control: Control<CustomerFormValues>;
  errors: any;
  isSubmitting: boolean;
}

export function CustomerCreateInline({
  control,
  errors,
  isSubmitting,
}: CustomerCreateInlineProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader title="Yeni Müşteri Ekle" />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Adı"
                  size="small"
                  required
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Soyadı"
                  size="small"
                  required
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 4 }}>
            <Controller
              name="companyName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Firma Adı (İsteğe Bağlı)"
                  size="small"
                  error={!!errors.companyName}
                  helperText={errors.companyName?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Telefon"
                  size="small"
                  required
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="E-posta"
                  type="email"
                  size="small"
                  required
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Adres"
                  size="small"
                  required
                  error={!!errors.address}
                  helperText={errors.address?.message}
                />
              )}
            />
          </Grid>
        </Grid>

        {errors.root && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.root.message}
          </Alert>
        )}
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        <Button
          type="submit"
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <PlusIcon />}
          variant="contained"
          disabled={isSubmitting}
        >
          Müşteriyi Kaydet
        </Button>
      </CardActions>
    </Card>
  );
}