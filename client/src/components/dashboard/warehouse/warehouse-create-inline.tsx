'use client';

import * as React from 'react';
import {
  Alert, Box, Button, Card, CardActions, CardContent, CardHeader,
  CircularProgress, Divider, Grid, Stack, TextField
} from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';

// Formdan gelecek değerlerin tipini tanımlayalım
interface WarehouseFormValues {
    name: string;
    address: string; // 'location' yerine 'address'
}

interface WarehouseCreateInlineProps {
  control: Control<WarehouseFormValues>;
  errors: any; // react-hook-form'dan gelen hatalar
  isSubmitting: boolean;
}

export function WarehouseCreateInline({
  control,
  errors,
  isSubmitting,
}: WarehouseCreateInlineProps): React.JSX.Element {

  return (
    <Card>
      <CardHeader title="Yeni Depo Ekle" />
      <Divider />
      <CardContent>
        {/* DÜZELTME: Grid container olarak işaretlendi */}
        <Grid container spacing={2}>
          {/* DÜZELTME: Grid size prop'u kullanıldı */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Depo Adı"
                  size="small"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>
          {/* DÜZELTME: Grid size prop'u kullanıldı */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Konum"
                  size="small"
                  error={!!errors.address}
                  helperText={errors.address?.message}
                />
              )}
            />
          </Grid>
        </Grid>
        {errors.root && <Alert severity="error" sx={{mt: 2}}>{errors.root.message}</Alert>}
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button
              type="submit"
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <PlusIcon />}
              variant="contained"
              disabled={isSubmitting}
          >
              Depoyu Kaydet
          </Button>
      </CardActions>
    </Card>
  );
}