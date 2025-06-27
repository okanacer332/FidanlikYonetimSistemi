'use client';

import * as React from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useFieldArray, useWatch } from 'react-hook-form';
import {
  Alert, Autocomplete, Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormLabel,
  Grid, IconButton, Paper, Radio, RadioGroup, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography
} from '@mui/material';
import { Plus as PlusIcon, Trash as TrashIcon } from '@phosphor-icons/react';

import type { Plant, Warehouse, Supplier } from '@/types/nursery';
import { StockType } from '@/types/nursery';

const receiptItemSchema = zod.object({
  plantId: zod.string().min(1, 'Fidan seçimi zorunludur.'),
  quantity: zod.number({ invalid_type_error: 'Miktar gereklidir.' }).positive('Miktar 0\'dan büyük olmalıdır.'),
  purchasePrice: zod.number({ invalid_type_error: 'Fiyat gereklidir.' }).min(0, 'Fiyat negatif olamaz.'),
});

const formSchema = zod.object({
  receiptNumber: zod.string().min(1, 'İrsaliye numarası zorunludur.'),
  supplierId: zod.string().min(1, 'Tedarikçi seçimi zorunludur.'),
  warehouseId: zod.string().min(1, 'Depo seçimi zorunludur.'),
  entryType: zod.nativeEnum(StockType),
  batchName: zod.string().optional(),
  items: zod.array(receiptItemSchema).min(1, 'En az bir fidan girişi yapılmalıdır.'),
}).refine(data => {
    if (data.entryType === StockType.IN_PRODUCTION) {
        return !!data.batchName && data.batchName.length > 0;
    }
    return true;
}, { message: "Üretim partisi için parti adı zorunludur.", path: ["batchName"] })
.refine(data => {
    if (data.entryType === StockType.IN_PRODUCTION && data.items.length > 1) {
        return false;
    }
    return true;
}, { message: "Üretim partisi başlangıcında sadece tek bir tür fidan girişi yapılabilir.", path: ["items"] });

type FormValues = zod.infer<typeof formSchema>;

interface GoodsReceiptCreateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FetchedData {
    plants: Plant[];
    warehouses: Warehouse[];
    suppliers: Supplier[];
}

export function GoodsReceiptCreateForm({ open, onClose, onSuccess }: GoodsReceiptCreateFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fetchedData, setFetchedData] = React.useState<FetchedData | null>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receiptNumber: '',
      supplierId: '',
      warehouseId: '',
      entryType: StockType.COMMERCIAL,
      batchName: '',
      items: [{ plantId: '', quantity: 1, purchasePrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const entryType = useWatch({ control, name: 'entryType' });

  // --- HATA AYIKLAMA İÇİN GÜNCELLENMİŞ FETCHDATA ---
  const fetchData = React.useCallback(async () => {
    setIsLoadingData(true);
    setFormError(null);
    console.log("Veri çekme işlemi başladı...");
    const token = localStorage.getItem('authToken');
    if (!token) {
        const errorMsg = 'Oturum bulunamadı. Lütfen tekrar giriş yapın.';
        setFormError(errorMsg);
        console.error(errorMsg);
        setIsLoadingData(false);
        return;
    }
    try {
        console.log("1. Fidanlar (plants) çekiliyor...");
        const plantsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!plantsRes.ok) throw new Error(`Fidanlar yüklenemedi. Sunucu yanıtı: ${plantsRes.status}`);
        const plants = await plantsRes.json();
        console.log("Fidanlar başarıyla çekildi.");

        console.log("2. Depolar (warehouses) çekiliyor...");
        const warehousesRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/warehouses`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!warehousesRes.ok) throw new Error(`Depolar yüklenemedi. Sunucu yanıtı: ${warehousesRes.status}`);
        const warehouses = await warehousesRes.json();
        console.log("Depolar başarıyla çekildi.");

        console.log("3. Tedarikçiler (suppliers) çekiliyor...");
        const suppliersRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!suppliersRes.ok) throw new Error(`Tedarikçiler yüklenemedi. Sunucu yanıtı: ${suppliersRes.status}`);
        const suppliers = await suppliersRes.json();
        console.log("Tedarikçiler başarıyla çekildi.");
        
        setFetchedData({ plants, warehouses, suppliers });
        console.log("Tüm veriler başarıyla state'e aktarıldı.");

    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
        setFormError(errorMsg); // Hatayı ekranda göster
        console.error("Veri çekme sırasında KRİTİK HATA:", err);
    } finally {
        setIsLoadingData(false);
        console.log("Veri çekme işlemi tamamlandı.");
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      fetchData();
      reset({
        receiptNumber: '',
        supplierId: '',
        warehouseId: '',
        entryType: StockType.COMMERCIAL,
        batchName: '',
        items: [{ plantId: '', quantity: 1, purchasePrice: 0 }],
      });
      setFormError(null);
    }
  }, [open, fetchData, reset]);

  const onSubmit = React.useCallback(async (values: FormValues): Promise<void> => {
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/goods-receipts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Mal girişi oluşturulamadı.');
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
        Yeni Mal Girişi
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Hata mesajı veya yükleme ekranı */}
            {isLoadingData ? (
                <Stack sx={{ alignItems: 'center', p: 3, minHeight: '400px', justifyContent: 'center' }}>
                    <CircularProgress />
                    <Typography sx={{mt: 2}}>Veriler yükleniyor...</Typography>
                </Stack>
            ) : formError ? (
                <Stack sx={{ alignItems: 'center', p: 3, minHeight: '400px', justifyContent: 'center' }}>
                     <Alert severity="error" sx={{width: '100%'}}>
                        <strong>Veri Yükleme Hatası:</strong> {formError}
                        <Typography variant="body2" sx={{mt: 1}}>
                            Lütfen tarayıcı konsolunu (F12) kontrol edin ve hatanın detayını geliştiriciye bildirin.
                        </Typography>
                     </Alert>
                </Stack>
            ) : (
            // Formun kendisi
            <Grid container spacing={4}>
              {/* LEFT COLUMN - RECEIPT DETAILS */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={3}>
                  <Typography variant="h6">Giriş Bilgileri</Typography>
                  <Controller
                    name="receiptNumber"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="İrsaliye Numarası" fullWidth required error={Boolean(errors.receiptNumber)} helperText={errors.receiptNumber?.message} />
                    )}
                  />
                  <Controller
                      name="supplierId"
                      control={control}
                      render={({ field }) => (
                          <Autocomplete
                              options={fetchedData?.suppliers || []}
                              getOptionLabel={(option) => option.name}
                              onChange={(_, newValue) => field.onChange(newValue ? newValue.id : '')}
                              renderInput={(params) => <TextField {...params} label="Tedarikçi" required error={Boolean(errors.supplierId)} helperText={errors.supplierId?.message} />}
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
                              renderInput={(params) => <TextField {...params} label="Giriş Deposu" required error={Boolean(errors.warehouseId)} helperText={errors.warehouseId?.message}/>}
                          />
                      )}
                  />
                  <Divider />
                   <Controller
                      name="entryType"
                      control={control}
                      render={({ field }) => (
                        <FormControl>
                          <FormLabel>Giriş Tipi</FormLabel>
                          <RadioGroup {...field} row>
                            <FormControlLabel value={StockType.COMMERCIAL} control={<Radio />} label="Ticari Mal" />
                            <FormControlLabel value={StockType.IN_PRODUCTION} control={<Radio />} label="Üretim Partisi Başlangıcı" />
                          </RadioGroup>
                        </FormControl>
                      )}
                    />
                    {entryType === StockType.IN_PRODUCTION && (
                      <Controller
                        name="batchName"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} label="Parti Adı" fullWidth required={entryType === StockType.IN_PRODUCTION} error={Boolean(errors.batchName)} helperText={errors.batchName?.message} />
                        )}
                      />
                    )}
                </Stack>
              </Grid>

              {/* RIGHT COLUMN - ITEM DETAILS */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={2}>
                  <Typography variant="h6">Giriş Yapılacak Fidanlar</Typography>
                  <Paper variant="outlined">
                    <TableContainer>
                      <Table size="small">
                          <TableHead>
                              <TableRow>
                                  <TableCell sx={{width: '50%', pl: 2 }}>Fidan</TableCell>
                                  <TableCell>Miktar</TableCell>
                                  <TableCell>Alış Fiyatı (Birim)</TableCell>
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
                                                  onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))}
                                                  error={Boolean(errors.items?.[index]?.quantity)} helperText={errors.items?.[index]?.quantity?.message} />
                                              )}
                                          />
                                      </TableCell>
                                      <TableCell sx={{ verticalAlign: 'top', pt: 1.5 }}>
                                          <Controller
                                              name={`items.${index}.purchasePrice`}
                                              control={control}
                                              render={({ field }) => (
                                                  <TextField {...field} type="number" variant="outlined" size="small" fullWidth required 
                                                  onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                                  error={Boolean(errors.items?.[index]?.purchasePrice)} helperText={errors.items?.[index]?.purchasePrice?.message} />
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
                    <Button size="small" startIcon={<PlusIcon />} onClick={() => append({ plantId: '', quantity: 1, purchasePrice: 0 })}>
                        Yeni Kalem Ekle
                    </Button>
                  </Box>
                </Stack>
              </Grid>

              {(errors.items || errors.root) && (
                <Grid size={{ xs: 12 }}>
                  {errors.items?.root && <Alert severity="error" sx={{mt: 2}}>{errors.items.root.message}</Alert>}
                  {errors.root && <Alert severity="error" sx={{mt: 2}}>{errors.root.message}</Alert>}
                </Grid>
              )}
              
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={onClose} disabled={isSubmitting}>İptal</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || isLoadingData || !!formError}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Mal Girişini Kaydet'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}