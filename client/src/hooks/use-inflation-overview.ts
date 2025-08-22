// client/src/hooks/use-inflation-overview.ts
import { useApiSWR } from './use-api-swr';

// Backend'deki DTO'muzun frontend'deki karşılığı
export interface InflationOverviewData {
    annualProducerPriceIndex: number;
    purchasingPowerOf10k: number;
    monthlyInflationTrend: {
        monthYear: string;
        rate: number;
    }[];
}

export const useInflationOverview = () => {
  // SWR hook'umuzu yeni endpoint ile çağırıyoruz
  const { data, error, isLoading, mutate } = useApiSWR<InflationOverviewData>('/reports/inflation-overview');

  return {
    data,
    error,
    isLoading,
    mutate, // Raporu manuel olarak yenilemek için
  };
};