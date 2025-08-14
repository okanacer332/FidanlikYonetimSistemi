import { useApiSWR } from '@/hooks/use-api-swr';
import type { Payment } from '@/types/nursery';

/**
 * Tüm ödeme ve tahsilat hareketlerini SWR ile çeker.
 * @returns SWR response objesi
 */
export const usePayments = () => useApiSWR<Payment[]>('/payments');

// Not: Yeni tahsilat ve tediye oluşturma fonksiyonları (createCollection, createPaymentToSupplier)
// şimdilik modal form bileşenleri içinde kalabilir. Gelecekte projenin tamamını
// servis katmanına taşıdığımızda onları da buraya alabiliriz.