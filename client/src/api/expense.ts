// client/src/api/expense.ts

import type { Expense, ExpenseCategory } from '@/types/expense';
import type { PaymentMethod } from '@/types/payment'; // Ödeme yöntemleri için (varsayım)
import type { GoodsReceipt } from '@/types/goods-receipt';

// API Base URL'sini tanımlıyoruz, process.env.NEXT_PUBLIC_API_URL undefined ise fallback kullanır
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Gider Oluşturma isteği için DTO
interface CreateExpenseRequest {
  description: string;
  amount: number;
  expenseDate: string; // ISO string
  categoryId: string;
  productionBatchId?: string; // Opsiyonel
  paymentMethod?: string; // Ödeme yöntemi ID'si
}

// Gider oluşturma API çağrısı
export const createExpense = async (
  request: CreateExpenseRequest
): Promise<Expense> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Gider oluşturulurken bir hata oluştu: ${response.status}`);
  }

  return response.json();
};


// Gider kategorilerini getirme API çağrısı
export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/expense-categories`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Gider kategorileri alınamadı: ${response.status}`);
  }

  return response.json();
};

// ... Diğer giderle ilgili API fonksiyonları buraya eklenebilir
// Örneğin:
// export const getAllExpenses = async (): Promise<Expense[]> => { ... };
// export const getExpensesByProductionBatch = async (batchId: string): Promise<Expense[]> => { ... };