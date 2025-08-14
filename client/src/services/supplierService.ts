import { useApiSWR } from '@/hooks/use-api-swr';
import type { Supplier, SupplierCreate } from '@/types/nursery';

/**
 * Tüm tedarikçileri SWR ile çeker.
 * @returns SWR response objesi
 */
export const useSuppliers = () => useApiSWR<Supplier[]>('/suppliers');

/**
 * Yeni bir tedarikçi oluşturur.
 * @param values - Yeni tedarikçi için form verileri
 * @returns Oluşturulan yeni tedarikçi objesi
 */
export const createSupplier = async (values: SupplierCreate): Promise<Supplier> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Oturum bulunamadı.');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Tedarikçi oluşturulamadı.');
    }
    return response.json();
};

/**
 * Mevcut bir tedarikçiyi günceller.
 * @param id - Güncellenecek tedarikçinin ID'si
 * @param values - Güncel tedarikçi verileri
 * @returns Güncellenen tedarikçi objesi
 */
export const updateSupplier = async (id: string, values: SupplierCreate): Promise<Supplier> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Oturum bulunamadı.');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Tedarikçi güncellenemedi.');
    }
    return response.json();
};

/**
 * Belirtilen ID'ye sahip tedarikçiyi siler.
 * @param id - Silinecek tedarikçinin ID'si
 */
export const deleteSupplier = async (id: string): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Oturum bulunamadı.');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Tedarikçi silinemedi.');
    }
};