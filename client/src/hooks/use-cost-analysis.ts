// client/src/hooks/use-cost-analysis.ts
import { useApiSWR } from './use-api-swr';
import dayjs from 'dayjs';

// Backend'deki DTO'muzun frontend'deki karşılığı
export interface CostAnalysisReportData {
    marketInflationTrend: DataPoint[];
    businessCostTrend: DataPoint[];
}

export interface DataPoint {
    label: string;
    indexValue: number;
}

// Hook'un alacağı parametreler
interface UseCostAnalysisParams {
    startDate: Date | null;
    endDate: Date | null;
    productionBatchId?: string | null;
}

export const useCostAnalysis = ({ startDate, endDate, productionBatchId }: UseCostAnalysisParams) => {
  // Sadece tüm parametreler geçerliyse bir URL oluştur
  const url = (startDate && endDate)
    ? `/reports/cost-analysis?startDate=${dayjs(startDate).format('YYYY-MM-DD')}&endDate=${dayjs(endDate).format('YYYY-MM-DD')}${productionBatchId ? `&productionBatchId=${productionBatchId}` : ''}`
    : null; // Parametreler eksikse istek atma

  const { data, error, isLoading, mutate } = useApiSWR<CostAnalysisReportData>(url);

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};