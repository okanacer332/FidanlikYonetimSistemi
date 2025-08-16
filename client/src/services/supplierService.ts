import { useApiSWR } from '@/hooks/use-api-swr';
import { apiClient } from '@/lib/apiClient'; // <-- 1. YENİ İSTEMCİYİ IMPORT ET
import type { Supplier, SupplierCreate } from '@/types/nursery';

/**
 * Tüm tedarikçileri SWR ile çeker.
 * Bu fonksiyon, güncellediğimiz useApiSWR'ı kullandığı için zaten doğru çalışıyor.
 */
export const useSuppliers = () => useApiSWR<Supplier[]>('/suppliers');

/**
 * Yeni bir tedarikçi oluşturur.
 * @param values - Yeni tedarikçi için form verileri
 * @returns Oluşturulan yeni tedarikçi objesi
 */
export const createSupplier = (values: SupplierCreate): Promise<Supplier> => {
    // 2. Eski fetch kodunu apiClient.post ile değiştiriyoruz.
    return apiClient.post<Supplier>('/suppliers', values);
};

/**
 * Mevcut bir tedarikçiyi günceller.
 * @param id - Güncellenecek tedarikçinin ID'si
 * @param values - Güncel tedarikçi verileri
 * @returns Güncellenen tedarikçi objesi
 */
export const updateSupplier = (id: string, values: SupplierCreate): Promise<Supplier> => {
    // 3. Eski fetch kodunu apiClient.put ile değiştiriyoruz.
    return apiClient.put<Supplier>(`/suppliers/${id}`, values);
};

/**
 * Belirtilen ID'ye sahip tedarikçiyi siler.
 * @param id - Silinecek tedarikçinin ID'si
 */
export const deleteSupplier = (id: string): Promise<void> => {
    // 4. Eski fetch kodunu apiClient.delete ile değiştiriyoruz.
    return apiClient.delete<void>(`/suppliers/${id}`);
};