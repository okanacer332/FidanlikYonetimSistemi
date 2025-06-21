// client/src/types/nursery.ts

// --- Ana Veri Tipleri ---

export interface Land {
  id: string;
  name: string;
  location: string;
  tenantId: string;
}

export interface PlantType {
  id: string;
  name: string;
  tenantId: string;
}

export interface Rootstock {
  id: string;
  name: string;
  tenantId: string;
}

export interface PlantSize {
  id: string;
  name: string;
  tenantId: string;
}

export interface PlantAge {
  id: string;
  name: string;
  tenantId: string;
}

export interface PlantVariety {
  id: string;
  name: string;
  plantTypeId: string;
  plantType?: PlantType; // DBRef'ten gelen dolu nesne (opsiyonel)
  tenantId: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  tenantId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  tenantId: string;
}

// --- YENİ EKLENEN TİP ---
// Backend'deki Stock modeline karşılık gelir.
export interface Stock {
  id: string;
  plantId: string;
  warehouseId: string;
  quantity: number;
  tenantId: string;
}
// --- YENİ TİP SONU ---


// --- Form Değerleri için Tipler ---

export interface PlantTypeCreate {
  name: string;
}

export interface RootstockCreate {
    name: string;
}

export interface PlantSizeCreate {
    name: string;
}

export interface PlantAgeCreate {
    name: string;
}

export interface PlantVarietyCreate {
    name: string;
    plantTypeId: string;
}


// --- Birleşik Tipler ---

// Backend'deki MasterDataDTO'ya karşılık gelen tip
export interface MasterData {
    plantTypes: PlantType[];
    plantVarieties: PlantVariety[];
    rootstocks: Rootstock[];
    plantSizes: PlantSize[];
    plantAges: PlantAge[];
    lands: Land[];
}

export interface Plant {
    id: string;
    plantType: PlantType;
    plantVariety: PlantVariety;
    rootstock: Rootstock;
    plantSize: PlantSize;
    plantAge: PlantAge;
    land: Land;
    tenantId: string;
}

export interface PlantCreateFormValues {
    plantTypeId: string;
    plantVarietyId: string;
    rootstockId: string;
    plantSizeId: string;
    plantAgeId: string;
    landId: string;
}

export interface WarehouseCreate {
  name: string;
  address: string;
}

export interface SupplierCreate {
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string; // Şirket adı opsiyonel olabilir
  phone: string;
  email: string;
  address: string; // Backend'deki gibi tek string olarak
  tenantId: string;
}

export interface CustomerCreate {
  firstName: string;
  lastName: string;
  companyName?: string;
  phone: string;
  email: string;
  address: string;
}

export interface OrderItemDto { // OrderItemDto buraya taşındı ve salePrice eklendi
  plantId: string;
  quantity: number;
  salePrice?: number; // Fidanın satış fiyatı, isteğe bağlı çünkü manuel girilecek veya tekliften gelecek
}

export interface OrderCreateRequest { // OrderCreateRequest buraya taşındı ve expectedDeliveryDate eklendi
  customerId: string;
  warehouseId: string;
  deliveryAddress?: string; // İsteğe bağlı
  items: OrderItemDto[];
  expectedDeliveryDate?: string; // ISO 8601 string formatında teslim tarihi
}

export enum OrderStatus {
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  warehouseId: string;
  items: OrderItemDto[]; // Backend'deki OrderItem'a benzer, salePrice içerecek
  totalAmount: number;
  status: OrderStatus;
  orderDate: string; // ISO 8601 string formatında
  userId: string;
  tenantId: string;
  expectedDeliveryDate?: string; // ISO 8601 string formatında
}