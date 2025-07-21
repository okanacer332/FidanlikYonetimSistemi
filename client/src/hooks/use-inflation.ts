import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';

export interface InflationData {
  id: string;
  period: string;
  cpiValue: number;
  tenantId: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const useInflation = () => {
  const [data, setData] = useState<InflationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getInflationData = useCallback(async () => {
    setIsLoading(true);
    try {
      const accessToken = window.localStorage.getItem('accessToken');
      if (!accessToken) {
        setIsLoading(false);
        return;
      }
      const response = await fetch(`${API_URL}/api/v1/inflation`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error('Veriler alınamadı.');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
      toast.error('Enflasyon verileri yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, getInflationData, setIsLoading, setData };
};