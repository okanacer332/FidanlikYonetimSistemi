import { apiClient } from '@/lib/apiClient'; // <-- 1. YENİ İSTEMCİYİ IMPORT ET
import type { Expense } from '@/types/nursery';

// Formdan gelen ve sadece gerekli alanları içeren tip
export type ExpenseCreatePayload = {
  description: string;
  amount: number;
  categoryId: string;
  expenseDate: string; // ISO Date String
  productionBatchId: string;
};

// Yeni bir gider oluşturmak için API isteği
export const createExpense = (data: ExpenseCreatePayload): Promise<Expense> => {
  // 2. karmaşık fetch kodunu, tek satırlık apiClient çağrısıyla değiştiriyoruz.
  return apiClient.post<Expense>('/expenses', data);
};