// Bu hook, SWR kullanarak enflasyon verilerini çeker ve yönetir.
import { useApiSWR } from './use-api-swr';
import type { InflationData } from '@/types/inflation';

export const useInflationData = () => {
  // SWR, verileri önbelleğe alır ve otomatik olarak güncel tutar.
  const { data, error, isLoading, mutate } = useApiSWR<InflationData[]>('/inflation');

  return {
    data,
    error,
    isLoading,
    mutate, // Veriyi manuel olarak yenilemek için
  };
};