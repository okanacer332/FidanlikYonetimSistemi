import { useApiSWR } from '@/hooks/use-api-swr';
import { apiClient } from '@/lib/apiClient'; // <-- 1. YENİ İSTEMCİYİ IMPORT ET
import type { Customer, CustomerCreate } from '@/types/nursery';

/**
 * Tüm müşterileri SWR ile çeker.
 * Bu fonksiyon, bir önceki adımda düzelttiğimiz useApiSWR'ı kullandığı için zaten doğru çalışıyor.
 */
export const useCustomers = () => useApiSWR<Customer[]>('/customers');

/**
 * Belirtilen ID'ye sahip tek bir müşteriyi SWR ile çeker.
 * Bu fonksiyon da useApiSWR'ı kullandığı için doğru çalışıyor.
 */
export const useCustomer = (id?: string) => useApiSWR<Customer>(id ? `/customers/${id}` : null);


/**
 * Yeni bir müşteri oluşturur.
 * @param values - Yeni müşteri için form verileri
 * @returns Oluşturulan yeni müşteri objesi
 */
export const createCustomer = (values: CustomerCreate): Promise<Customer> => {
    // 2. karmaşık fetch kodunu, tek satırlık apiClient çağrısıyla değiştiriyoruz.
    return apiClient.post<Customer>('/customers', values);
};

/**
 * Belirtilen ID'ye sahip müşteriyi siler.
 * @param id - Silinecek müşterinin ID'si
 */
export const deleteCustomer = (id: string): Promise<void> => {
    // 3. Buradaki fetch kodunu da apiClient ile değiştiriyoruz.
    return apiClient.delete<void>(`/customers/${id}`);
};

// Not: updateCustomer fonksiyonu CustomerEditForm içinde kullanılıyor olabilir,
// projenin tutarlılığı için onu da buraya taşımak bir sonraki adım olabilir.