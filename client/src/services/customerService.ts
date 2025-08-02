import { useApiSWR } from '@/hooks/use-api-swr';
import type { Customer, CustomerCreate } from '@/types/nursery';

/**
 * Tüm müşterileri SWR ile çeker.
 * @returns SWR response objesi
 */
export const useCustomers = () => useApiSWR<Customer[]>('/customers');

/**
 * Belirtilen ID'ye sahip tek bir müşteriyi SWR ile çeker.
 * @param id - Çekilecek müşterinin ID'si
 * @returns SWR response objesi
 */
export const useCustomer = (id?: string) => useApiSWR<Customer>(id ? `/customers/${id}` : null);


/**
 * Yeni bir müşteri oluşturur.
 * @param values - Yeni müşteri için form verileri
 * @returns Oluşturulan yeni müşteri objesi
 */
export const createCustomer = async (values: CustomerCreate): Promise<Customer> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Oturum bulunamadı.');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Müşteri oluşturulamadı.');
    }
    return response.json();
};

/**
 * Belirtilen ID'ye sahip müşteriyi siler.
 * @param id - Silinecek müşterinin ID'si
 */
export const deleteCustomer = async (id: string): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Oturum bulunamadı.');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Müşteri silinemedi.');
    }
};

// Not: updateCustomer fonksiyonu CustomerEditForm içinde kullanılıyor olabilir,
// projenin tutarlılığı için onu da buraya taşımak bir sonraki adım olabilir.