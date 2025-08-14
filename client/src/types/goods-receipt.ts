// client/src/types/goods-receipt.ts

import type { Plant } from './plant'; // Eğer GoodsReceiptItem'da Plant detaylarına ihtiyaç duyulursa

// GoodsReceiptItem tipi (server tarafındaki model ile uyumlu)
export interface ReceiptItemDto {
  plantId: string;
  quantity: number;
  unitCost: number; // Fidanın birim maliyeti (alış fiyatı veya üretim birim maliyeti)
  // Bu alana ihtiyacımız kalmadı, GoodsReceiptRequest içindeki sourceType tarafından yönetiliyor.
  // isCommercial?: boolean;
  // productionBatchId?: string; // GoodsReceiptRequest'in sourceId'si olarak taşındı
}

// GoodsReceipt tipi (server tarafındaki model ile uyumlu)
export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  // Eski supplierId alanı yerine sourceType ve sourceId kullanıldı
  // supplierId?: string;
  warehouseId: string;
  items: ReceiptItemDto[];
  totalValue: number; // BigDecimal yerine number kullanıldı (client tarafı için)
  status: 'COMPLETED' | 'CANCELED'; // Enum yerine union type
  userId: string;
  receiptDate: string; // LocalDateTime yerine ISO string
  tenantId: string;
  sourceType: 'SUPPLIER' | 'PRODUCTION_BATCH'; // Mal girişinin kaynağı
  sourceId: string; // sourceType'a göre supplierId veya productionBatchId
}