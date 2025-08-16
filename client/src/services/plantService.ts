import { useApiSWR } from '@/hooks/use-api-swr';
import { apiClient } from '@/lib/apiClient'; // <-- 1. YENİ İSTEMCİYİ IMPORT ET
import type { Plant, MasterData, PlantCreateFormValues } from '@/types/nursery';

/**
 * Master datayı (fidan türleri, çeşitleri vb.) SWR ile çeker.
 * Bu fonksiyon, güncellediğimiz useApiSWR'ı kullandığı için zaten doğru çalışıyor.
 */
export const useMasterData = () => useApiSWR<MasterData>('/master-data');

/**
 * Yeni bir fidan kimliği oluşturmak için backend'e POST isteği atar.
 * @param values - Yeni fidan için form verileri
 * @returns Oluşturulan yeni fidan objesi
 */
export const createPlant = (values: PlantCreateFormValues): Promise<Plant> => {
    // 2. karmaşık fetch kodunu, tek satırlık apiClient çağrısıyla değiştiriyoruz.
    return apiClient.post<Plant>('/plants', values);
};

/**
 * Belirtilen ID'ye sahip fidanı silmek için backend'e DELETE isteği atar.
 * @param plantId - Silinecek fidanın ID'si
 */
export const deletePlant = (plantId: string): Promise<void> => {
    // 3. Buradaki fetch kodunu da apiClient ile değiştiriyoruz.
    return apiClient.delete<void>(`/plants/${plantId}`);
};