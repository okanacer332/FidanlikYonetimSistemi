// client/src/api/reports.ts
import { format } from 'date-fns';
import type { RealProfitLossReport } from '@/types/nursery';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getRealProfitLossReport = async (startDate: Date, endDate: Date, baseDate: Date): Promise<RealProfitLossReport> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Oturum bulunamadı.');
  }

  const formattedStartDate = format(startDate, 'dd-MM-yyyy');
  const formattedEndDate = format(endDate, 'dd-MM-yyyy');
  const formattedBaseDate = format(baseDate, 'dd-MM-yyyy');

  const url = `${API_BASE_URL}/accounting/reports/profit-loss/real?startDate=${formattedStartDate}&endDate=${formattedEndDate}&baseDate=${formattedBaseDate}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Gerçek Kar/Zarar raporu alınamadı: ${response.status}`);
  }
  return response.json();
};