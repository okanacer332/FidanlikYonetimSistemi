'use client';

import * as React from 'react';
import {
  Alert, Autocomplete, Box, Button, Card, CardActions, CardContent, CardHeader,
  CircularProgress, Divider, Grid, IconButton, Stack, TextField
} from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import type { Control } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';

import type { MasterData, PlantCreateFormValues } from '@/types/nursery';

interface PlantCreateInlineProps {
  control: Control<PlantCreateFormValues>;
  errors: any;
  masterData: MasterData | null;
  isSubmitting: boolean;
  onAddMasterData: (type: 'plantType' | 'plantVariety' | 'rootstock' | 'plantSize' | 'plantAge' | 'land') => void;
}

export function PlantCreateInline({
  control,
  errors,
  masterData,
  isSubmitting,
  onAddMasterData,
}: PlantCreateInlineProps): React.JSX.Element {
  
  const selectedValues = useWatch({ control });

  const renderAutocompleteWithAdd = (
    name: keyof PlantCreateFormValues,
    label: string,
    options: readonly { id: string; name: string }[] | undefined = [],
    onAddClick: () => void,
    disabled: boolean = false
  ) => (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const { onChange, value, ...rest } = field;
          const selectedOption = options.find(option => option.id === value) || null;

          return (
            <Autocomplete {...rest} fullWidth value={selectedOption}
              onChange={(_, newValue) => { onChange(newValue ? newValue.id : ''); }}
              options={options} getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, val) => option.id === val.id}
              disabled={disabled}
              renderInput={(params) => (<TextField {...params} label={label} error={!!error} helperText={error?.message} size="small"/>)}
            />
          );
        }}
      />
      <IconButton color="primary" onClick={onAddClick} disabled={disabled} sx={{ mt: '1px' }}><PlusIcon /></IconButton>
    </Stack>
  );

  const filteredVarieties = React.useMemo(() => {
    if (!masterData || !selectedValues.plantTypeId) return [];
    return masterData.plantVarieties.filter(v => v.plantTypeId === selectedValues.plantTypeId);
  }, [masterData, selectedValues.plantTypeId]);

  return (
    <Card>
      <CardHeader title="Yeni Fidan Kimliği Ekle" />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>{renderAutocompleteWithAdd('plantTypeId', 'Fidan Türü', masterData?.plantTypes, () => onAddMasterData('plantType'))}</Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>{renderAutocompleteWithAdd('plantVarietyId', 'Fidan Çeşidi', filteredVarieties, () => onAddMasterData('plantVariety'), !selectedValues.plantTypeId)}</Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>{renderAutocompleteWithAdd('rootstockId', 'Anaç', masterData?.rootstocks, () => onAddMasterData('rootstock'), !selectedValues.plantVarietyId)}</Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>{renderAutocompleteWithAdd('plantSizeId', 'Fidan Boyu', masterData?.plantSizes, () => onAddMasterData('plantSize'), !selectedValues.rootstockId)}</Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>{renderAutocompleteWithAdd('plantAgeId', 'Fidan Yaşı', masterData?.plantAges, () => onAddMasterData('plantAge'), !selectedValues.plantSizeId)}</Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>{renderAutocompleteWithAdd('landId', 'Arazi', masterData?.lands, () => onAddMasterData('land'), !selectedValues.plantAgeId)}</Grid>
        </Grid>
        {errors.root && <Alert severity="error" sx={{mt: 2}}>{errors.root.message}</Alert>}
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button type="submit" startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <PlusIcon />} variant="contained" disabled={isSubmitting}>
              Fidan Kimliğini Kaydet
          </Button>
      </CardActions>
    </Card>
  );
}