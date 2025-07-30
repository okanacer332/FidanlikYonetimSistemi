// client/src/types/plant.ts

// Server tarafındaki PlantType modeline karşılık gelir
export interface PlantType {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
}

// Server tarafındaki PlantVariety modeline karşılık gelir
export interface PlantVariety {
  id: string;
  name: string;
  description?: string;
  plantTypeId: string; // Hangi PlantType'a ait olduğunu belirtir
  tenantId: string;
}

// YENİ EKLENEN: Server tarafındaki ProductionBatch modeline karşılık gelir
export interface ProductionBatch {
  id: string;
  batchCode: string; // Partinin benzersiz kodu
  batchName: string; // Partinin adı
  startDate: string; // ISO string formatında tarih (backend LocalDate tutuyor)
  initialQuantity: number; // Başlangıçtaki fidan adedi
  currentQuantity: number; // Mevcut fidan adedi (fire düşüldükten sonra)
  costPool: number; // Partiye eklenen toplam maliyet (nominal)
  inflationAdjustedCostPool?: number; // Enflasyon düzeltilmiş maliyet havuzu (opsiyonel)
  lastCostUpdateDate?: string; // Maliyet havuzunun en son ne zaman güncellendiği (ISO string)
  expectedHarvestQuantity?: number; // Üretim partisinden toplanması beklenen toplam fidan adedi (opsiyonel)
  harvestedQuantity?: number; // Üretim partisinden şimdiye kadar hasat edilen fidan adedi (opsiyonel)
  status: 'CREATED' | 'GROWING' | 'HARVESTED' | 'COMPLETED' | 'CANCELLED'; // Parti durumu
  description?: string; // Parti açıklaması (opsiyonel)
  plantTypeId: string;
  plantVarietyId: string;
  tenantId: string;
  // PlantType ve PlantVariety objeleri doğrudan backend'den gelmeyebilir,
  // ancak UI'da göstermek için ihtiyaç duyulursa buraya eklenebilir.
  // plantType?: PlantType;
  // plantVariety?: PlantVariety;
}

// İleride kullanılacaksa Plant modelinin temel yapısı
export interface Plant {
  id: string;
  plantCode: string;
  plantTypeId: string;
  plantVarietyId: string;
  tenantId: string;
  // Diğer fidan özellikleri buraya eklenebilir (boyut, yaş, anaç vb.)
  // plantSizeId: string;
  // plantAgeId: string;
  // rootstockId: string;
}