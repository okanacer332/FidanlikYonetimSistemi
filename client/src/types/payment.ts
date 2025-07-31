// client/src/types/payment.ts

// Server tarafındaki Payment modeline karşılık gelir
export interface Payment {
  id: string;
  tenantId: string;
  userId: string;
  paymentDate: string;
  amount: number; // BigDecimal yerine number
  paymentMethod: string; // Ödeme yöntemi ID'si
  relatedDocumentId?: string; // İlgili doküman ID'si (fatura, gider, vb.)
}

// Ödeme Yöntemi tipine karşılık gelir (varsayım)
export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
}