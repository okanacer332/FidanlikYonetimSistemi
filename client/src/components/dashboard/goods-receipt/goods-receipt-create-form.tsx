'use client';

import * as React from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import {
  Alert, Autocomplete, Box, Button, CircularProgress, Grid, IconButton, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Divider
} from '@mui/material';
import { Plus as PlusIcon, Trash as TrashIcon } from '@phosphor-icons/react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// --- HATA BURADAYDI, DOĞRU YOL İLE DEĞİŞTİRİLDİ ---
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { tr } from 'date-fns/locale';

import type { Plant, Warehouse, Supplier, ProductionBatch, GoodsReceipt } from '@/types/nursery';

const receiptItemSchema = zod.object({
  plantId: zod.string().min(1, 'Fidan seçimi zorunludur.'),
  quantity: zod.coerce.number({ invalid_type_error: 'Miktar gereklidir.' }).positive('Miktar 0\'dan büyük olmalıdır.'),
  unitCost: zod.coerce.number({ invalid_type_error: 'Maliyet gereklidir.' }).min(0, 'Maliyet negatif olamaz.'),
});

const formSchema = zod.object({
  receiptNumber: zod.string().min(1, 'İrsaliye/Fiş numarası zorunludur.'),
  warehouseId: zod.string().min(1, 'Depo seçimi zorunludur.'),
  receiptDate: zod.date({ required_error: 'Giriş tarihi zorunludur.' }),
  sourceType: zod.enum(['SUPPLIER', 'PRODUCTION_BATCH'], { required_error: 'Kaynak tipi seçimi zorunludur.'}),
  sourceId: zod.string().min(1, 'Kaynak seçimi zorunludur.'),
  items: zod.array(receiptItemSchema).min(1, 'En az bir fidan girişi yapılmalıdır.'),
});

type FormValues = zod.infer<typeof formSchema>;

const defaultValues = {
  receiptNumber: '',
  warehouseId: '',
  receiptDate: new Date(),
  sourceType: 'SUPPLIER' as 'SUPPLIER' | 'PRODUCTION_BATCH',
  sourceId: '',
  items: [{ plantId: '', quantity: 1, unitCost: 0 }],
};

interface GoodsReceiptCreateFormProps {
  onSuccess: (newReceipt: GoodsReceipt) => void;
  onCancel: () => void;
}

interface FetchedData {
    plants: Plant[];
    warehouses: Warehouse[];
    suppliers: Supplier[];
    productionBatches: ProductionBatch[];
}

export function GoodsReceiptCreateForm({ onSuccess, onCancel }: GoodsReceiptCreateFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fetchedData, setFetchedData] = React.useState<FetchedData | null>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const sourceType = watch('sourceType');
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const fetchData = React.useCallback(async () => {
    setIsLoadingData(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
        setFormError('Oturum bulunamadı.');
        setIsLoadingData(false);
        return;
    }
    try {
        const [plantsRes, warehousesRes, suppliersRes, batchesRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/warehouses`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/production-batches`, { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);
        if (!plantsRes.ok || !warehousesRes.ok || !suppliersRes.ok || !batchesRes.ok) {
            throw new Error('Gerekli veriler yüklenemedi.');
        }
        const data: FetchedData = {
            plants: await plantsRes.json(),
            warehouses: await warehousesRes.json(),
            suppliers: await suppliersRes.json(),
            productionBatches: await batchesRes.json(),
        };
        setFetchedData(data);
    } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    } finally {
        setIsLoadingData(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    reset(defaultValues);
    setFormError(null);
  }, [fetchData, reset]);

  const onSubmit = React.useCallback(async (values: FormValues): Promise<void> => {
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı.');
      const payload = {
        ...values,
        receiptDate: values.receiptDate.toISOString(),
      };
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/goods-receipts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const newReceipt = await response.json();
      if (!response.ok) {
        throw new Error(newReceipt.message || 'Mal girişi oluşturulamadı.');
      }
      onSuccess(newReceipt);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    }
  }, [onSuccess]);
  
  const getPlantLabel = (plant: Plant) => 
    `${plant.plantType.name} - ${plant.plantVariety.name} / ${plant.rootstock.name} (${plant.plantSize.name} - ${plant.plantAge.name})`;

  if (isLoadingData) {
    return <Stack sx={{ alignItems: 'center', p: 3, minHeight: '400px', justifyContent: 'center' }}><CircularProgress /></Stack>;
  }

  return (
      <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={3}>
                <Typography variant="h6">Giriş Bilgileri</Typography>
                <Controller name="receiptNumber" control={control} render={({ field }) => ( <TextField {...field} label="İrsaliye/Fiş Numarası" fullWidth required error={Boolean(errors.receiptNumber)} helperText={errors.receiptNumber?.message} /> )}/>
                <Controller name="warehouseId" control={control} render={({ field }) => ( <Autocomplete options={fetchedData?.warehouses || []} getOptionLabel={(option) => option.name} onChange={(_, newValue) => field.onChange(newValue ? newValue.id : '')} renderInput={(params) => <TextField {...params} label="Giriş Deposu" required error={Boolean(errors.warehouseId)} helperText={errors.warehouseId?.message}/>} /> )}/>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                  <Controller
                    name="receiptDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="Giriş Tarihi"
                        format="dd/MM/yyyy"
                        value={field.value}
                        onChange={(date) => field.onChange(date)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            error: Boolean(errors.receiptDate),
                            helperText: errors.receiptDate?.message,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
                <Controller name="sourceType" control={control} render={({ field }) => (
                    <FormControl>
                        <FormLabel>Giriş Kaynağı</FormLabel>
                        <RadioGroup row {...field}><FormControlLabel value="SUPPLIER" control={<Radio />} label="Tedarikçi" /><FormControlLabel value="PRODUCTION_BATCH" control={<Radio />} label="Üretim Partisi" /></RadioGroup>
                    </FormControl>
                )}/>
                {sourceType === 'SUPPLIER' && ( <Controller name="sourceId" control={control} render={({ field }) => ( <Autocomplete options={fetchedData?.suppliers || []} getOptionLabel={(option) => option.name} onChange={(_, newValue) => field.onChange(newValue ? newValue.id : '')} renderInput={(params) => <TextField {...params} label="Tedarikçi" required error={Boolean(errors.sourceId)} helperText={errors.sourceId?.message} />} /> )}/> )}
                {sourceType === 'PRODUCTION_BATCH' && ( <Controller name="sourceId" control={control} render={({ field }) => ( <Autocomplete options={fetchedData?.productionBatches || []} getOptionLabel={(option) => option.batchName || 'İsimsiz Parti'} onChange={(_, newValue) => field.onChange(newValue ? newValue.id : '')} renderInput={(params) => <TextField {...params} label="Üretim Partisi" required error={Boolean(errors.sourceId)} helperText={errors.sourceId?.message} />} /> )}/> )}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
                {/* ... Formun sağ tarafı (kalemler) aynı kalacak ... */}
                <Stack spacing={2}>
                <Typography variant="h6">Giriş Yapılacak Fidanlar</Typography>
                <Paper variant="outlined">
                  <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{width: '50%', pl: 2 }}>Fidan</TableCell>
                                <TableCell>Miktar</TableCell>
                                <TableCell>Birim Maliyet (Alış/Üretim)</TableCell>
                                <TableCell align="center">İşlem</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fields.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell sx={{ pl: 2 }}><Controller name={`items.${index}.plantId`} control={control} render={({ field }) => ( <Autocomplete options={fetchedData?.plants || []} getOptionLabel={getPlantLabel} value={fetchedData?.plants.find(p => p.id === field.value) || null} onChange={(_, newValue) => field.onChange(newValue ? newValue.id : '')} renderInput={(params) => <TextField {...params} placeholder="Fidan seçin..." variant="outlined" size="small" error={Boolean(errors.items?.[index]?.plantId)} helperText={errors.items?.[index]?.plantId?.message}/>} /> )}/></TableCell>
                                    <TableCell><Controller name={`items.${index}.quantity`} control={control} render={({ field }) => ( <TextField {...field} type="number" variant="outlined" size="small" fullWidth required onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} error={Boolean(errors.items?.[index]?.quantity)} helperText={errors.items?.[index]?.quantity?.message} /> )}/></TableCell>
                                    <TableCell><Controller name={`items.${index}.unitCost`} control={control} render={({ field }) => ( <TextField {...field} type="number" variant="outlined" size="small" fullWidth required onChange={e => field.onChange(parseFloat(e.target.value) || 0)} error={Boolean(errors.items?.[index]?.unitCost)} helperText={errors.items?.[index]?.unitCost?.message} /> )}/></TableCell>
                                    <TableCell align="center"><IconButton onClick={() => remove(index)} color="error" size="small"><TrashIcon /></IconButton></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
                <Box><Button size="small" startIcon={<PlusIcon />} onClick={() => append({ plantId: '', quantity: 1, unitCost: 0 })}>Yeni Kalem Ekle</Button></Box>
              </Stack>
            </Grid>
          </Grid>
          {(errors.items || formError) && (<Box sx={{ mt: 3 }}>{errors.items?.root && <Alert severity="error">{errors.items.root.message}</Alert>}{formError && <Alert severity="error">{formError}</Alert>}</Box>)}
          <Divider sx={{ my: 3 }} />
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button onClick={onCancel} disabled={isSubmitting} variant="outlined">İptal</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting || isLoadingData}>{isSubmitting ? <CircularProgress size={24} /> : 'Mal Girişini Kaydet'}</Button>
          </Stack>
      </form>
  );
}