// client/src/api/expense.ts

import type { Expense, ExpenseCategory } from '@/types/expense';
import type { PaymentMethod } from '@/types/payment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Gider Oluşturma isteği için DTO
interface CreateExpenseRequest {
  description: string;
  amount: number;
  expenseDate: string;
  categoryId: string;
  productionBatchId?: string;
  paymentMethod?: string;
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

// Tüm giderleri getirme API çağrısı
export const getExpenses = async (): Promise<Expense[]> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/expenses`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Giderler alınamadı: ${response.status}`);
  }

  return response.json();
};

// YENİ EKLENEN: Yeni gider kategorisi oluşturma API çağrısı
interface CreateExpenseCategoryRequest {
  name: string;
  description?: string;
}

export const createExpenseCategory = async (
  request: CreateExpenseCategoryRequest
): Promise<ExpenseCategory> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/expense-categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Gider kategorisi oluşturulurken bir hata oluştu: ${response.status}`);
  }

  return response.json();
};