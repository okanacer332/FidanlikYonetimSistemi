import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';

export interface InflationData {
  id: string;
  period: string;
  cpiValue: number;
  tenantId: string;
}

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
      const response = await fetch('/api/v1/inflation', {
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
    // DÜZELTME: useCallback'in bağımlılık dizisine state'leri güncelleyen
    // fonksiyonları ekliyoruz. Bu, 'stale closure' sorununu çözer.
  }, [setIsLoading, setData]);

  return { data, isLoading, getInflationData, setIsLoading, setData };
};