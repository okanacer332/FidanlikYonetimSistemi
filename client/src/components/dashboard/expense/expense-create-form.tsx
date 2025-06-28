'use client';

import * as React from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack,
  TextField, CircularProgress, Typography, Autocomplete // Autocomplete import edildi
} from '@mui/material';
import dayjs from 'dayjs';

// ProductionBatch tipi de import edildi
import type { ExpenseCategory, ProductionBatch } from '@/types/nursery';
import { PaymentMethod } from '@/types/nursery';

const schema = zod.object({
  amount: zod.coerce.number().positive({ message: 'Tutar 0\'dan büyük olmalıdır.' }),
  expenseDate: zod.string().min(1, 'Gider tarihi zorunludur.'),
  categoryId: zod.string().min(1, 'Kategori seçimi zorunludur.'),
  paymentMethod: zod.nativeEnum(PaymentMethod),
  description: zod.string().min(1, 'Açıklama zorunludur.'),
  productionBatchId: zod.string().optional().nullable(), // YENİ EKLENEN: Opsiyonel ve null olabilir
});

type FormValues = zod.infer<typeof schema>;

interface ExpenseCreateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: ExpenseCategory[];
}

export function ExpenseCreateForm({ open, onClose, onSuccess, categories }: ExpenseCreateFormProps): React.JSX.Element {
  const [formError, setFormError] = React.useState<string | null>(null);
  const [productionBatches, setProductionBatches] = React.useState<ProductionBatch[]>([]); // YENİ: Üretim partilerini tutacak state
  const [isLoadingProductionBatches, setIsLoadingProductionBatches] = React.useState(true); // YENİ: Yükleme durumu

  const defaultValues = React.useMemo(() => ({
    amount: 0,
    expenseDate: dayjs().format('YYYY-MM-DD'),
    categoryId: '',
    paymentMethod: PaymentMethod.CASH,
    description: '',
    productionBatchId: null, // YENİ: Varsayılan olarak null
  }), []);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  // YENİ: Üretim partilerini çeken useEffect
  React.useEffect(() => {
    async function fetchProductionBatches() {
      if (!open) return; // Modal kapalıysa veri çekme
      setIsLoadingProductionBatches(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Oturum bulunamadı.');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/production-batches`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Üretim partileri yüklenemedi.');
        }
        setProductionBatches(await response.json());
      } catch (err) {
        console.error('Üretim partileri yüklenirken hata:', err);
        setFormError(err instanceof Error ? err.message : 'Üretim partileri yüklenirken bir ağ hatası oluştu.');
        setProductionBatches([]); // Hata durumunda listeyi temizle
      } finally {
        setIsLoadingProductionBatches(false);
      }
    }
    fetchProductionBatches();

    // Modal kapandığında formu sıfırla
    return () => {
        if (!open) {
            reset(defaultValues);
            setFormError(null);
        }
    };
  }, [open, reset, defaultValues]);


  const onSubmit = React.useCallback(async (values: FormValues): Promise<void> => {
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı.');

      const payload = {
        ...values,
        // productionBatchId null ise gönderme veya backend'in beklediği değere çevir
        productionBatchId: values.productionBatchId || null,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gider kaydedilemedi.');
      }
      onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    }
  }, [onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Gider Ekle</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tutar"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  fullWidth
                  required
                  error={Boolean(errors.amount)}
                  helperText={errors.amount?.message}
                />
              )}
            />
             <Controller
              name="expenseDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Gider Tarihi"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  error={Boolean(errors.expenseDate)}
                  helperText={errors.expenseDate?.message}
                />
              )}
            />
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.categoryId)}>
                  <InputLabel required>Kategori</InputLabel>
                  <Select {...field} label="Kategori">
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                  {errors.categoryId && <FormHelperText>{errors.categoryId.message}</FormHelperText>}
                </FormControl>
              )}
            />
             <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.paymentMethod)}> {/* BURASI DÜZELTİLDİ */}
                  <InputLabel required>Ödeme Yöntemi</InputLabel>
                  <Select {...field} label="Ödeme Yöntemi">
                    <MenuItem value={PaymentMethod.CASH}>Nakit</MenuItem>
                    <MenuItem value={PaymentMethod.BANK_TRANSFER}>Banka Transferi</MenuItem>
                    <MenuItem value={PaymentMethod.CREDIT_CARD}>Kredi Kartı</MenuItem>
                  </Select>
                  {errors.paymentMethod && <FormHelperText>{errors.paymentMethod.message}</FormHelperText>} {/* BURASI DÜZELTİLDİ */}
                </FormControl>
              )}
            /> 
            {/* YENİ EKLENEN: Üretim Partisi seçimi */}
            <Controller
              name="productionBatchId"
              control={control}
              render={({ field }) => {
                // field.value string ID olduğu için, eşleşen ProductionBatch objesini buluyoruz
                const selectedOption = productionBatches.find(
                  (pb) => pb.id === field.value
                ) || null; // Eşleşen yoksa null

                return (
                  <Autocomplete
                    // Autocomplete'in kendi 'value' prop'una artık ProductionBatch objesini iletiyoruz
                    value={selectedOption} // BURASI DÜZELTİLDİ
                    options={productionBatches}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, val) => option.id === val.id}
                    onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                    loading={isLoadingProductionBatches}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="İlgili Üretim Partisi (İsteğe Bağlı)"
                        fullWidth
                        error={Boolean(errors.productionBatchId)}
                        helperText={errors.productionBatchId?.message}
                      />
                    )}
                  />
                );
              }}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Açıklama"
                  fullWidth
                  required
                  multiline
                  rows={2}
                  error={Boolean(errors.description)}
                  helperText={errors.description?.message}
                />
              )}
            />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>İptal</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || isLoadingProductionBatches}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}