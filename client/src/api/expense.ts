// Konum: src/api/expense.ts

import type { Expense, ExpenseCategory } from '@/types/expense';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Gider Oluşturma
export const createExpense = async (data: { description: string; amount: number; expenseDate: string; categoryId: string; }): Promise<Expense> => {
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

// Giderleri Listeleme
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

// Gider Kategorilerini Listeleme
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

// Yeni Gider Kategorisi Oluşturma
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

// --- EKSİK OLAN FONKSİYONLAR ---

// Gider Kategorisi Güncelleme
export const updateExpenseCategory = async (id: string, data: { name: string, description?: string }): Promise<ExpenseCategory> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Oturum bulunamadı.');
    const response = await fetch(`${API_BASE_URL}/expense-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kategori güncellenemedi.');
    }
    return response.json();
};

// Gider Kategorisi Silme
export const deleteExpenseCategory = async (id: string): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Oturum bulunamadı.');
    const response = await fetch(`${API_BASE_URL}/expense-categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kategori silinemedi.');
    }
};