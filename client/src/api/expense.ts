// Konum: src/api/expense.ts

import type { Expense, ExpenseCategory } from '@/types/expense';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// --- YENİ EKLENEN FONKSİYON ---
// Yeni gider oluşturma
export const createExpense = async (data: {
  description: string;
  amount: number;
  expenseDate: string;
  categoryId: string;
}): Promise<Expense> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Oturum bulunamadı.');
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Gider oluşturulamadı.');
  }
  return response.json();
};
// --- YENİ EKLENEN FONKSİYON SONU ---

// Tüm giderleri getirme
export const getExpenses = async (): Promise<Expense[]> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Oturum bulunamadı.');
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Giderler alınamadı.');
  }
  return response.json();
};

// Tüm gider kategorilerini getirme
export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Oturum bulunamadı.');
  const response = await fetch(`${API_BASE_URL}/expense-categories`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Gider kategorileri alınamadı.');
  }
  return response.json();
};

// Yeni gider kategorisi oluşturma
export const createExpenseCategory = async (data: { name: string, description?: string }): Promise<ExpenseCategory> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Oturum bulunamadı.');
    const response = await fetch(`${API_BASE_URL}/expense-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kategori oluşturulamadı.');
    }
    return response.json();
};