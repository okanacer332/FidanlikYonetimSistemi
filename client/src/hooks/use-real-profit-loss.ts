// client/src/hooks/use-real-profit-loss.ts
import { useApiSWR } from './use-api-swr';
import dayjs from 'dayjs';

// Backend'deki RealProfitLossReportDTO'nun frontend'deki karşılığı
export interface RealProfitLossReportData {
    period: string;
    nominalRevenue: number;
    realRevenue: number;
    nominalCostOfGoodsSold: number;
    realCostOfGoodsSold: number;
    nominalOperatingExpenses: number;
    realOperatingExpenses: number;
    nominalGrossProfit: number;
    realGrossProfit: number;
    nominalNetProfit: number;
    realNetProfit: number;
    baseInflationDate: string;
}

interface UseRealProfitLossParams {
    startDate: Date | null;
    endDate: Date | null;
}

export const useRealProfitLoss = ({ startDate, endDate }: UseRealProfitLossParams) => {
  // Raporun mantığı gereği 'baseDate' genellikle 'endDate' olur.
  const baseDate = endDate;

  const url = (startDate && endDate && baseDate)
    ? `/accounting/reports/profit-loss/real?startDate=${dayjs(startDate).format('DD-MM-YYYY')}&endDate=${dayjs(endDate).format('DD-MM-YYYY')}&baseDate=${dayjs(baseDate).format('DD-MM-YYYY')}`
    : null;

  const { data, error, isLoading, mutate } = useApiSWR<RealProfitLossReportData>(url);

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};