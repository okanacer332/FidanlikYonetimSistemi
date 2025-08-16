import { useApiSWR } from '@/hooks/use-api-swr';
import { apiClient } from '@/lib/apiClient'; // <-- 1. YENİ İSTEMCİYİ IMPORT ET
import type { Warehouse, WarehouseCreate } from '@/types/nursery';

/**
 * Tüm depoları SWR ile çeker.
 * Bu fonksiyon, güncellediğimiz useApiSWR'ı kullandığı için zaten doğru çalışıyor.
 */
export const useWarehouses = () => useApiSWR<Warehouse[]>('/warehouses');

/**
 * Yeni bir depo oluşturur.
 * @param values - Yeni depo için form verileri
 * @returns Oluşturulan yeni depo objesi
 */
export const createWarehouse = (values: WarehouseCreate): Promise<Warehouse> => {
    // 2. Eski fetch kodunu apiClient.post ile değiştiriyoruz.
    return apiClient.post<Warehouse>('/warehouses', values);
};

/**
 * Mevcut bir depoyu günceller.
 * @param id - Güncellenecek deponun ID'si
 * @param values - Güncel depo verileri
 * @returns Güncellenen depo objesi
 */
export const updateWarehouse = (id: string, values: WarehouseCreate): Promise<Warehouse> => {
    // 3. Eski fetch kodunu apiClient.put ile değiştiriyoruz.
    return apiClient.put<Warehouse>(`/warehouses/${id}`, values);
};


/**
 * Belirtilen ID'ye sahip depoyu siler.
 * @param id - Silinecek deponun ID'si
 */
export const deleteWarehouse = (id: string): Promise<void> => {
    // 4. Eski fetch kodunu apiClient.delete ile değiştiriyoruz.
    return apiClient.delete<void>(`/warehouses/${id}`);
};