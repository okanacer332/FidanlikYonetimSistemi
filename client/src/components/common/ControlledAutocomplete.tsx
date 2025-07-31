'use client';
import * as React from 'react';
import { Autocomplete, TextField, Stack, IconButton, AutocompleteProps, TextFieldProps } from '@mui/material';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Plus as PlusIcon } from '@phosphor-icons/react';

type ControlledAutocompleteProps<
  T,
  TFieldValues extends FieldValues
> = Omit<
  AutocompleteProps<T, false, false, false>, // multiple, disableClearable, freeSolo false olarak sabitlendi
  'options' | 'renderInput' | 'value' | 'onChange'
> & {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  options: readonly T[];
  onAddClick?: () => void;
  size?: TextFieldProps['size'];
};

export function ControlledAutocomplete<
  T extends { id: string; name: string },
  TFieldValues extends FieldValues
>({
  control,
  name,
  label,
  options,
  onAddClick,
  size,
  ...rest
}: ControlledAutocompleteProps<T, TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Autocomplete
            {...rest}
            fullWidth
            // 1. ADIM: Değeri Bulma
            // Form state'indeki 'id'yi kullanarak tam option objesini buluyoruz.
            // Bu, Autocomplete'in seçili etiketi doğru göstermesi için kritik.
            value={options.find((option) => option.id === field.value) || null}
            
            // 2. ADIM: Değişikliği Yönetme
            // Kullanıcı bir seçim yaptığında, RHF'ye sadece 'id'yi iletiyoruz.
            onChange={(event, newValue) => {
              // newValue null ise (temizlendi ise) veya obje değilse, boş string gönder.
              // Aksi halde objenin id'sini gönder.
              field.onChange(newValue ? newValue.id : '');
            }}

            options={options}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                error={!!error}
                helperText={error?.message}
                size={size}
              />
            )}
          />
          {onAddClick && (
            <IconButton color="primary" onClick={onAddClick}>
              <PlusIcon />
            </IconButton>
          )}
        </Stack>
      )}
    />
  );
}