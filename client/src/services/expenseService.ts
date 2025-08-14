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
export async function createExpense(data: ExpenseCreatePayload): Promise<Expense> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found.');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Gider oluşturulamadı.');
  }

  return responseData;
}