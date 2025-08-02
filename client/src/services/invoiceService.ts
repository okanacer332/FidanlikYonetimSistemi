import { useApiSWR } from '@/hooks/use-api-swr';
import type { Customer, Invoice } from '@/types/nursery';

/**
 * Tüm faturaları SWR ile çeker.
 * @returns SWR response objesi
 */
export const useInvoices = () => useApiSWR<Invoice[]>('/invoices');
export const useInvoice = (id?: string) => useApiSWR<Invoice>(id ? `/invoices/${id}` : null);
export const useCustomer = (id?: string) => useApiSWR<Customer>(id ? `/customers/${id}` : null);

// Not: Fatura oluşturma/güncelleme/silme gibi işlemler,
// siparişler veya mal kabuller üzerinden tetiklendiği için
// bu serviste şimdilik sadece listeleme fonksiyonu yeterlidir.