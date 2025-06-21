'use client';

import * as React from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import {
  Alert, Autocomplete, Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Grid, IconButton, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography
} from '@mui/material';
import { Plus as PlusIcon, Trash as TrashIcon } from '@phosphor-icons/react';

import type { Plant, Warehouse, Customer } from '@/types/nursery';

const orderItemSchema = zod.object({
  plantId: zod.string().min(1, 'Fidan seçimi zorunludur.'),
  quantity: zod.coerce.number({ invalid_type_error: 'Miktar gereklidir.' }).positive({ message: 'Miktar 0\'dan büyük olmalıdır.' }),
  salePrice: zod.coerce.number({ invalid_type_error: 'Fiyat gereklidir.' }).min(0, { message: 'Fiyat negatif olamaz.' }),
});

const formSchema = zod.object({
  customerId: zod.string().min(1, 'Müşteri seçimi zorunludur.'),
  warehouseId: zod.string().min(1, 'Depo seçimi zorunludur.'),
  expectedDeliveryDate: zod.string().optional(),
  items: zod.array(orderItemSchema).min(1, 'En az bir fidan girişi yapılmalıdır.'),
});

type FormValues = zod.infer<typeof formSchema>;

interface OrderCreateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FetchedData {
    plants: Plant[];
    warehouses: Warehouse[];
    customers: Customer[];
}

export function OrderCreateForm({ open, onClose, onSuccess }: OrderCreateFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fetchedData, setFetchedData] = React.useState<FetchedData | null>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: '',
      warehouseId: '',
      expectedDeliveryDate: '',
      items: [{ plantId: '', quantity: 1, salePrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const fetchData = React.useCallback(async () => {
    setIsLoadingData(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
        setFormError('Oturum bulunamadı.');
        setIsLoadingData(false);
        return;
    }
    try {
        const [plantsRes, warehousesRes, customersRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/warehouses`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`, { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        if (!plantsRes.ok || !warehousesRes.ok || !customersRes.ok) {
            throw new Error('Sipariş oluşturmak için gerekli veriler yüklenemedi.');
        }
        
        const data: FetchedData = {
            plants: await plantsRes.json(),
            warehouses: await warehousesRes.json(),
            customers: await customersRes.json(),
        };
        setFetchedData(data);
    } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    } finally {
        setIsLoadingData(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      fetchData();
      reset({
        customerId: '',
        warehouseId: '',
        expectedDeliveryDate: '',
        items: [{ plantId: '', quantity: 1, salePrice: 0 }],
      });
      setFormError(null);
    }
  }, [open, fetchData, reset]);

  const onSubmit = React.useCallback(async (values: FormValues): Promise<void> => {
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      
      const payload = {
        ...values,
        expectedDeliveryDate: values.expectedDeliveryDate ? new Date(values.expectedDeliveryDate).toISOString() : undefined,
        items: values.items.map(item => ({...item}))
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sipariş oluşturulamadı.');
      }
      onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    }
  }, [onSuccess]);
  
  const getPlantLabel = (plant: Plant) => 
    `${plant.plantType.name} - ${plant.plantVariety.name} / ${plant.rootstock.name} (${plant.plantSize.name} - ${plant.plantAge.name})`;


  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
        Yeni Sipariş Oluştur
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {isLoadingData ? (
            <Stack sx={{ alignItems: 'center', p: 3, minHeight: '400px', justifyContent: 'center' }}><CircularProgress /></Stack>
          ) : (
            <Grid container spacing={4}>

              {/* LEFT COLUMN - ORDER DETAILS */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={3}>
                  <Typography variant="h6">Sipariş Bilgileri</Typography>
                  <Controller
                      name="customerId"
                      control={control}
                      render={({ field }) => (
                          <Autocomplete
                              options={fetchedData?.customers || []}
                              getOptionLabel={(option) => `${option.firstName} ${option.lastName} ${option.companyName ? `(${option.companyName})` : ''}`}
                              onChange={(_, newValue) => field.onChange(newValue ? newValue.id : '')}
                              renderInput={(params) => <TextField {...params} label="Müşteri" required error={Boolean(errors.customerId)} helperText={errors.customerId?.message} />}
                          />
                      )}
                  />
                  <Controller
                      name="warehouseId"
                      control={control}
                      render={({ field }) => (
                          <Autocomplete
                              options={fetchedData?.warehouses || []}
                              getOptionLabel={(option) => option.name}
                              onChange={(_, newValue) => field.onChange(newValue ? newValue.id : '')}
                              renderInput={(params) => <TextField {...params} label="Çıkış Deposu" required error={Boolean(errors.warehouseId)} helperText={errors.warehouseId?.message}/>}
                          />
                      )}
                  />
                  <Controller
                      name="expectedDeliveryDate"
                      control={control}
                      render={({ field }) => (
                          <TextField
                            {...field}
                            type="date"
                            label="Tahmini Teslim Tarihi"
                            InputLabelProps={{ shrink: true }}
                          />
                      )}
                  />
                </Stack>
              </Grid>

              {/* RIGHT COLUMN - ITEM DETAILS */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={2}>
                  <Typography variant="h6">Sipariş Kalemleri</Typography>
                  <Paper variant="outlined">
                    <TableContainer>
                      <Table size="small">
                          <TableHead>
                              <TableRow>
                                  <TableCell sx={{width: '50%', pl: 2 }}>Fidan</TableCell>
                                  <TableCell>Miktar</TableCell>
                                  <TableCell>Satış Fiyatı (Birim)</TableCell>
                                  <TableCell align="center">İşlem</TableCell>
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {fields.map((item, index) => (
                                  <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                      <TableCell sx={{ pl: 2, verticalAlign: 'top', pt: 1.5 }}>
                                          <Controller
                                              name={`items.${index}.plantId`}
                                              control={control}
                                              render={({ field }) => (
                                                  <Autocomplete
                                                      options={fetchedData?.plants || []}
                                                      getOptionLabel={getPlantLabel}
                                                      value={fetchedData?.plants.find(p => p.id === field.value) || null}
                                                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : '')}
                                                      renderInput={(params) => <TextField {...params} placeholder="Fidan seçin..." variant="outlined" size="small" error={Boolean(errors.items?.[index]?.plantId)} helperText={errors.items?.[index]?.plantId?.message}/>}
                                                  />
                                              )}
                                          />
                                      </TableCell>
                                      <TableCell sx={{ verticalAlign: 'top', pt: 1.5 }}>
                                          <Controller
                                              name={`items.${index}.quantity`}
                                              control={control}
                                              render={({ field }) => (
                                                  <TextField {...field} type="number" variant="outlined" size="small" fullWidth required 
                                                  error={Boolean(errors.items?.[index]?.quantity)} helperText={errors.items?.[index]?.quantity?.message} />
                                              )}
                                          />
                                      </TableCell>
                                      <TableCell sx={{ verticalAlign: 'top', pt: 1.5 }}>
                                          <Controller
                                              name={`items.${index}.salePrice`}
                                              control={control}
                                              render={({ field }) => (
                                                  <TextField {...field} type="number" variant="outlined" size="small" fullWidth required 
                                                  error={Boolean(errors.items?.[index]?.salePrice)} helperText={errors.items?.[index]?.salePrice?.message} />
                                              )}
                                          />
                                      </TableCell>
                                      <TableCell align="center" sx={{pr: 2, verticalAlign: 'top', pt: 1.5}}>
                                          <IconButton onClick={() => remove(index)} color="error" size="small" aria-label="Kalemi sil" sx={{mt: 1}}>
                                              <TrashIcon />
                                          </IconButton>
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                  <Box>
                    <Button size="small" startIcon={<PlusIcon />} onClick={() => append({ plantId: '', quantity: 1, salePrice: 0 })}>
                        Yeni Kalem Ekle
                    </Button>
                  </Box>
                </Stack>
              </Grid>

              {(errors.items || formError) && (
                <Grid size={{ xs: 12 }}>
                  {errors.items?.root && <Alert severity="error" sx={{mt: 2}}>{errors.items.root.message}</Alert>}
                  {formError && <Alert severity="error" sx={{mt: 2}}>{formError}</Alert>}
                </Grid>
              )}
              
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={onClose} disabled={isSubmitting}>İptal</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || isLoadingData}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Siparişi Oluştur'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}