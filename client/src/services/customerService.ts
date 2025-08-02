import { useApiSWR } from '@/hooks/use-api-swr';
import type { Customer, CustomerCreate } from '@/types/nursery';

/**
 * Tüm müşterileri SWR ile çeker.
 * @returns SWR response objesi
 */
export const useCustomers = () => useApiSWR<Customer[]>('/customers');

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
 * Mevcut bir müşteriyi günceller.
 * @param id - Güncellenecek müşterinin ID'si
 * @param values - Güncel müşteri verileri
 * @returns Güncellenen müşteri objesi
 */
export const updateCustomer = async (id: string, values: CustomerCreate): Promise<Customer> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Oturum bulunamadı.');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Müşteri güncellenemedi.');
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