import { useApiSWR } from '@/hooks/use-api-swr';
import type { Warehouse, WarehouseCreate } from '@/types/nursery';

/**
 * Tüm depoları SWR ile çeker.
 * @returns SWR response objesi
 */
export const useWarehouses = () => useApiSWR<Warehouse[]>('/warehouses');

/**
 * Yeni bir depo oluşturur.
 * @param values - Yeni depo için form verileri
 * @returns Oluşturulan yeni depo objesi
 */
export const createWarehouse = async (values: WarehouseCreate): Promise<Warehouse> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Oturum bulunamadı.');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/warehouses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Depo oluşturulamadı.');
    }
    return response.json();
};

/**
 * Mevcut bir depoyu günceller.
 * @param id - Güncellenecek deponun ID'si
 * @param values - Güncel depo verileri
 * @returns Güncellenen depo objesi
 */
export const updateWarehouse = async (id: string, values: WarehouseCreate): Promise<Warehouse> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Oturum bulunamadı.');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/warehouses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Depo güncellenemedi.');
    }
    return response.json();
};


/**
 * Belirtilen ID'ye sahip depoyu siler.
 * @param id - Silinecek deponun ID'si
 */
export const deleteWarehouse = async (id: string): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Oturum bulunamadı.');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/warehouses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Depo silinemedi.');
    }
};