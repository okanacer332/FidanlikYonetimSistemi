// Konum: src/services/stockService.ts

import { useApiSWR } from '@/hooks/use-api-swr';
import type { StockSummary } from '@/types/nursery';

/**
 * Tüm stok özetini SWR ile çeker.
 * Backend bu endpoint'te fidan ve depo bilgilerini birleştirip hazır bir DTO döner.
 * @returns SWR response objesi
 */
export const useStockSummary = () => useApiSWR<StockSummary[]>('/stock');