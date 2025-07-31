'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import type { z } from 'zod';
import { z as zod } from 'zod';
import { toast } from 'react-hot-toast';

import {
  Button,
  FormControl,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Stack,
  Dialog, // Modal için
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress, // Yükleme göstergesi
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Typography from '@mui/material/Typography';

import { useApi } from '@/hooks/use-api';
import type { Warehouse } from '@/types/warehouse'; // Depo tipi (eğer warehouse.ts dosyanızda tanımlıysa)
import type { Plant } from '@/types/plant'; // Plant tipi (eğer plant.ts dosyanızda tanımlıysa)
import { createGoodsReceipt } from '@/api/nursery'; // createGoodsReceipt API fonksiyonu

// Warehouse tipi varsayımı
// Eğer zaten tanımlı değilse, client/src/types/warehouse.ts dosyasında tanımlamalısınız.
// export interface Warehouse {
//   id: string;
//   name: string;
//   description?: string;
//   tenantId: string;
// }

// Plant tipi varsayımı
// Eğer zaten tanımlı değilse, client/src/types/plant.ts dosyasında tanımlamalısınız (üstte eklendi).
// export interface Plant {
//   id: string;
//   plantCode: string;
//   // diğer plant özellikleri
//   plantTypeId: string;
//   plantVarietyId: string;
// }


interface HarvestFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productionBatchId: string;
  plantId: string; // Hasat edilen fidanın ID'si (ProductionBatch'ten gelen)
  currentBatchQuantity: number; // Üretim partisinin mevcut fidan adedi (validasyon için)
}

// Form Şeması
const schema = zod.object({
  quantity: zod.number().min(1, 'Hasat adedi en az 1 olmalıdır.').int('Hasat adedi tam sayı olmalıdır.')
    .refine((val) => val > 0, { message: 'Hasat adedi pozitif olmalıdır.' }), // Sadece pozitif kontrolü
  warehouseId: zod.string().min(1, 'Depo seçimi zorunludur.'),
  receiptDate: zod.date({ required_error: 'Hasat Tarihi zorunludur.' }),
});

type FormData = z.infer<typeof schema>;

export function HarvestForm({ open, onClose, onSuccess, productionBatchId, plantId, currentBatchQuantity }: HarvestFormProps): React.JSX.Element {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ 
    resolver: zodResolver(schema),
    defaultValues: {
      receiptDate: new Date(), // Varsayılan olarak bugünün tarihi
    }
  });

  // Depo listesini çekme
  const { data: warehouses, isLoading: isLoadingWarehouses, error: warehousesError } = useApi<Warehouse[]>('/api/v1/warehouses');

  const onSubmit = React.useCallback(
    async (data: FormData): Promise<void> => {
      // Hasat edilen miktar, üretim partisindeki mevcut miktardan fazla olamaz
      if (data.quantity > currentBatchQuantity) {
        toast.error(`Hasat adedi (${data.quantity}) mevcut parti miktarından (${currentBatchQuantity}) fazla olamaz.`);
        return;
      }

      try {
        // GoodsReceiptRequest DTO'sunu kullanarak API çağrısı yapıyoruz
        // sourceType: PRODUCTION_BATCH ve sourceId: productionBatchId olarak set ediliyor
        await createGoodsReceipt({
          receiptNumber: `HST-${Date.now()}`, // Basit bir hasat irsaliye numarası
          sourceType: 'PRODUCTION_BATCH',
          sourceId: productionBatchId,
          warehouseId: data.warehouseId,
          receiptDate: dayjs(data.receiptDate).toISOString(),
          items: [{
            plantId: plantId,
            quantity: data.quantity,
            unitCost: 0, // Üretim partisi için unitCost backend tarafından hesaplanacak
          }],
        });

        toast.success('Hasat başarıyla kaydedildi ve stok güncellendi!');
        reset();
        onClose();
        onSuccess?.(); // Başarılı callback'i çağır
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
        console.error("Hasat kaydetme hatası:", err);
      }
    },
    [onClose, onSuccess, reset, productionBatchId, plantId, currentBatchQuantity]
  );

  // Yükleme veya hata durumunda
  if (isLoadingWarehouses) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Hasat Kaydı</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
          <Typography textAlign="center">Depo bilgileri yükleniyor...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (warehousesError) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Hasat Kaydı</DialogTitle>
        <DialogContent>
          <Typography color="error">Depo verileri yüklenirken hata oluştu: {warehousesError.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Kapat</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Üretim Partisinden Hasat Yap</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Üretim partisinden hasat edilecek fidan miktarını ve hangi depoya aktarılacağını girin.
          <br/>
          Parti Mevcut Adedi: <strong>{currentBatchQuantity}</strong>
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ paddingTop: '16px' }}>
            <Stack spacing={2}>
              <TextField
                {...register('quantity', { valueAsNumber: true })}
                label="Hasat Edilen Adet"
                type="number"
                placeholder="Hasat edilen fidan adedini girin"
                error={!!errors.quantity}
                helperText={errors.quantity?.message}
                fullWidth
              />

              <FormControl fullWidth error={!!errors.warehouseId}>
                <InputLabel>Hedef Depo</InputLabel>
                <Controller
                  name="warehouseId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Hedef Depo"
                      onChange={(e) => field.onChange(e.target.value as string)}
                      value={field.value || ''}
                    >
                      <MenuItem value="">Seçiniz</MenuItem>
                      {warehouses?.map((warehouse) => (
                        <MenuItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.warehouseId && <Typography color="error" variant="caption">{errors.warehouseId.message}</Typography>}
              </FormControl>

              <FormControl fullWidth error={!!errors.receiptDate}>
                <FormLabel>Hasat Tarihi</FormLabel>
                <Controller
                  name="receiptDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      format="DD/MM/YYYY"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(newValue) => {
                        field.onChange(newValue ? (newValue as dayjs.Dayjs).toDate() : null);
                      }}
                      slotProps={{ textField: { error: !!errors.receiptDate, helperText: errors.receiptDate?.message } }}
                    />
                  )}
                />
              </FormControl>

              <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
                <Button variant="outlined" color="inherit" onClick={onClose} disabled={isSubmitting}>
                  İptal
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  Hasatı Kaydet
                </Button>
              </Stack>
            </Stack>
          </form>
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
}