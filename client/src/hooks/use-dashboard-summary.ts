import type { DashboardSummaryDTO } from '@/types/dashboard'; // Bu DTO tipini birazdan oluşturacağız
import { useApiSWR } from './use-api-swr';

export const useDashboardSummary = () => {
  // SWR, bu endpoint'ten gelen verileri otomatik olarak yönetecek,
  // önbelleğe alacak ve gerektiğinde yenileyecektir.
  const { data, error, isLoading, mutate } = useApiSWR<DashboardSummaryDTO>('/dashboard/summary');

  return {
    summary: data,
    error,
    isLoading,
    mutate, // Dashboard'u manuel olarak yenilemek için
  };
};