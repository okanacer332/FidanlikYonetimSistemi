// client/src/hooks/use-price-performance.ts
import { useApiSWR } from './use-api-swr';
import dayjs from 'dayjs';

// Backend'deki DTO'muzun frontend'deki karşılığı
export interface PricePerformanceReportData {
    priceTrend: DataPoint[];
}

export interface DataPoint {
    label: string;
    nominalPrice: number;
    shouldBePrice: number;
}

// Hook'un alacağı parametreler
interface UsePricePerformanceParams {
    startDate: Date | null;
    endDate: Date | null;
    plantId: string | null; // Bu rapor için plantId zorunlu
}

export const usePricePerformance = ({ startDate, endDate, plantId }: UsePricePerformanceParams) => {
  // Sadece tüm parametreler geçerliyse bir URL oluştur
  const url = (startDate && endDate && plantId)
    ? `/reports/price-performance?startDate=${dayjs(startDate).format('YYYY-MM-DD')}&endDate=${dayjs(endDate).format('YYYY-MM-DD')}&plantId=${plantId}`
    : null; // Parametreler eksikse istek atma

  const { data, error, isLoading, mutate } = useApiSWR<PricePerformanceReportData>(url);

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};