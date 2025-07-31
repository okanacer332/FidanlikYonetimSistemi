// src/components/common/ControlledFormField.tsx
'use client';

import * as React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';

// Bileşenimizin alacağı propları tanımlıyoruz.
// Generic <TFieldValues> sayesinde formumuzun tip güvenliğini sağlıyoruz.
type ControlledFormFieldProps<TFieldValues extends FieldValues> = {
  // 'control' ve 'name' propları react-hook-form'dan geliyor ve zorunlu.
  control: Control<TFieldValues>;
  name: Path<TFieldValues>; // 'Path' tipi, name'in form değerlerinden biri olmasını sağlar.
} & Omit<TextFieldProps, 'name' | 'defaultValue'>; // Standart TextField proplarını da kabul etsin.

export function ControlledFormField<TFieldValues extends FieldValues>({
  control,
  name,
  ...rest
}: ControlledFormFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field} // field prop'u (onChange, onBlur, value, ref) TextField'e bağlanır.
          {...rest}  // label, placeholder gibi diğer tüm TextField propları buraya gelir.
          // Hata yönetimi:
          error={!!error} // Eğer bir hata varsa, TextField'i hata durumuna geçir.
          helperText={error ? error.message : rest.helperText || ''} // Hata mesajını veya normal helper text'i göster.
        />
      )}
    />
  );
}