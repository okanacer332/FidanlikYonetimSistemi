// client/src/types/expense.ts

// Server tarafındaki ExpenseCategory modeline karşılık gelir
export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
}

// Server tarafındaki Expense modeline karşılık gelir
export interface Expense {
  id: string;
  tenantId: string;
  userId: string;
  description: string;
  amount: number; // BigDecimal yerine number
  expenseDate: string; // LocalDate yerine ISO string
  categoryId: string; // Kategori ID'si
  productionBatchId?: string; // Giderin ilişkili olduğu üretim partisinin ID'si (opsiyonel)
}

// Server tarafındaki PaymentMethod modeline karşılık gelir (varsayım)
export interface PaymentMethod {
  id: string;
  name: string;
  // Diğer ödeme yöntemleri özellikleri
}