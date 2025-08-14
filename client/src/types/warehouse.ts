// client/src/types/warehouse.ts

// Server tarafındaki Warehouse modeline karşılık gelir
export interface Warehouse {
  id: string;
  name: string;
  location?: string; // Konum bilgisi (opsiyonel)
  capacity?: number; // Kapasite bilgisi (opsiyonel)
  description?: string; // Açıklama (opsiyonel)
  tenantId: string;
}