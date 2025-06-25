// client/src/types/nursery.ts

// --- YENİ EKLENEN TİPLER (ÖDEME) ---

export interface OverviewReportDto {
    totalCustomers: number;
    totalSales: number;
    totalOrders: number;
    totalPlantsInStock: number;
}

export interface TopSellingPlantReport {
    plantTypeName: string;
    plantVarietyName: string;
    totalQuantitySold: number;
}



export interface CustomerSalesReport {
    customerFirstName: string;
    customerLastName: string;
    totalSalesAmount: number;
    orderCount: number;
}

export interface ExpenseCategory {
    id: string;
    name: string;
    description: string;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    category: ExpenseCategory;
    expenseDate: string;
    userId: string;
    paymentId: string;
}

export enum PaymentType {
    COLLECTION = 'COLLECTION', // Tahsilat
    PAYMENT = 'PAYMENT'        // Tediye
}

export enum PaymentMethod {
    CASH = 'CASH',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CREDIT_CARD = 'CREDIT_CARD'
}

export enum RelatedEntityType {
    CUSTOMER = 'CUSTOMER',
    SUPPLIER = 'SUPPLIER',
    EXPENSE = 'EXPENSE'
}

export interface Payment {
    id: string;
    tenantId: string;
    userId: string;
    type: PaymentType;
    method: PaymentMethod;
    paymentDate: string; // ISO Date String
    amount: number;
    description: string;
    relatedId: string;
    relatedEntityType: RelatedEntityType;
    invoiceId?: string;
}

// ... (dosyanın geri kalanı aynı kalacak)

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
  plantType?: PlantType;
  tenantId: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string; // DEĞİŞİKLİK: 'location' yerine 'address'
  tenantId: string;
  createdAt: string; // JSON'da string olarak gelir
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

export interface Stock {
  id: string;
  plantId: string;
  warehouseId: string;
  quantity: number;
  tenantId: string;
}

export enum InvoiceStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    PAID = 'PAID',
    CANCELED = 'CANCELED'
}

export interface InvoiceItem {
    plantId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface Invoice {
    id: string;
    tenantId: string;
    invoiceNumber: string;
    customerId: string;
    orderId: string;
    issueDate: string; 
    dueDate: string; 
    totalAmount: number;
    status: InvoiceStatus;
    items: InvoiceItem[];
    userId: string;
}

export interface Transaction {
  id: string;
  transactionDate: string; 
  customerId?: string;
  supplierId?: string;
  type: 'DEBIT' | 'CREDIT'; 
  amount: number;
  description: string;
  relatedDocumentId: string;
  userId: string;
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

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  phone: string;
  email: string;
  address: string;
  tenantId: string;
}

export enum OrderStatus {
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

export interface OrderItemDto {
  plantId: string;
  quantity: number;
  salePrice?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  warehouseId: string;
  items: OrderItemDto[];
  totalAmount: number;
  status: OrderStatus;
  orderDate: string; 
  userId: string;
  tenantId: string;
  expectedDeliveryDate?: string; 
}

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

export interface MasterData {
    plantTypes: PlantType[];
    plantVarieties: PlantVariety[];
    rootstocks: Rootstock[];
    plantSizes: PlantSize[];
    plantAges: PlantAge[];
    lands: Land[];
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
  address: string; // DEĞİŞİKLİK: 'location' yerine 'address'
}

export interface SupplierCreate {
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
}

export interface CustomerCreate {
  firstName: string;
  lastName: string;
  companyName?: string;
  phone: string;
  email: string;
  address: string;
}

export interface OrderCreateRequest {
  customerId: string;
  warehouseId: string;
  deliveryAddress?: string;
  items: OrderItemDto[];
  expectedDeliveryDate?: string;
}

export interface ProfitabilityReportDto {
  plantId: string;
  plantName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}