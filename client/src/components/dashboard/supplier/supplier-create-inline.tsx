// Dosya Yolu: client/src/components/dashboard/supplier/supplier-create-inline.tsx
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

// --- ÇÖZÜM: 'email' alanını opsiyonel yapıyoruz ---
interface SupplierFormValues {
  name: string;
  contactPerson: string;
  phone: string;
  email?: string; // 'string' yerine 'string | undefined' veya 'email?: string' olmalı
  address: string;
}

interface SupplierCreateInlineProps {
  control: Control<SupplierFormValues>;
  errors: any; 
  isSubmitting: boolean;
}

export function SupplierCreateInline({
  control,
  errors,
  isSubmitting,
}: SupplierCreateInlineProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader title="Yeni Tedarikçi Ekle" />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Tedarikçi Adı"
                  size="small"
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="contactPerson"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Yetkili Kişi"
                  size="small"
                  required
                  error={!!errors.contactPerson}
                  helperText={errors.contactPerson?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
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
          Tedarikçiyi Kaydet
        </Button>
      </CardActions>
    </Card>
  );
}