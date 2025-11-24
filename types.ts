/**
 * TypeScript Types for Kyte-like POS System
 * Auto-generated from Supabase schema
 */

// =====================================================
// ENUMS
// =====================================================

export type SaleStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'CANCELLED'
  | 'REFUNDED';
export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';
export type PaymentMethod =
  | 'PIX'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'WALLET'
  | 'OTHER';
export type StockMovementType =
  | 'IN'
  | 'OUT'
  | 'ADJUSTMENT'
  | 'RETURN'
  | 'TRANSFER'
  | 'LOSS';
export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER';
export type NotificationType =
  | 'SALE'
  | 'PAYMENT'
  | 'STOCK'
  | 'SYSTEM'
  | 'PROMOTION'
  | 'ALERT';
export type ExpenseCategory =
  | 'RENT'
  | 'UTILITIES'
  | 'SALARIES'
  | 'SUPPLIES'
  | 'MARKETING'
  | 'TAXES'
  | 'MAINTENANCE'
  | 'OTHER';
export type DiscountType =
  | 'PERCENTAGE'
  | 'FIXED'
  | 'BUY_X_GET_Y'
  | 'FREE_SHIPPING';

// =====================================================
// DATABASE TABLES
// =====================================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  user_id: string;
  name: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  email?: string;
  phone?: string;
  website?: string;
  cnpj?: string;
  tax_id?: string;
  address: StoreAddress;
  business_hours: BusinessHours;
  currency: string;
  timezone: string;
  language: string;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreAddress {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface BusinessHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

export interface StoreMember {
  id: string;
  store_id: string;
  user_id: string;
  role: UserRole;
  permissions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: string;
  key: string;
  name: string;
  description?: string;
  category?: string;
  default_enabled: boolean;
  config_schema: Record<string, any>;
  created_at: string;
}

export interface StoreFeature {
  id: string;
  store_id: string;
  feature_id: string;
  enabled: boolean;
  config: Record<string, any>;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  slug?: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  color?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id?: string;
  name: string;
  slug?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost_price?: number;
  compare_at_price?: number;
  track_inventory: boolean;
  stock: number;
  stock_min: number;
  stock_max?: number;
  image_url?: string;
  images: string[];
  has_variants: boolean;
  ncm?: string;
  cest?: string;
  tax_rate: number;
  unit: string;
  weight?: number;
  dimensions?: ProductDimensions;
  tags?: string[];
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductDimensions {
  width?: number;
  height?: number;
  depth?: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku?: string;
  barcode?: string;
  price?: number;
  cost_price?: number;
  stock: number;
  option1_name?: string;
  option1_value?: string;
  option2_name?: string;
  option2_value?: string;
  option3_name?: string;
  option3_value?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  store_id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  address: StoreAddress;
  tags?: string[];
  notes?: string;
  total_spent: number;
  total_orders: number;
  average_ticket: number;
  loyalty_points: number;
  loyalty_tier?: string;
  accepts_marketing: boolean;
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  store_id: string;
  customer_id?: string;
  cashier_id?: string;
  sale_number?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_cpf?: string;
  subtotal: number;
  discount: number;
  discount_type?: string;
  discount_code?: string;
  tax: number;
  shipping: number;
  total: number;
  paid_amount: number;
  change_amount: number;
  status: SaleStatus;
  notes?: string;
  internal_notes?: string;
  delivery_method?: string;
  delivery_address?: StoreAddress;
  delivery_date?: string;
  tracking_code?: string;
  nfe_number?: string;
  nfe_key?: string;
  nfe_url?: string;
  nfe_issued_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  cancelled_at?: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id?: string;
  variant_id?: string;
  product_name: string;
  product_sku?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
  total: number;
  cost_price?: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Payment {
  id: string;
  sale_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  installments: number;
  installment_amount?: number;
  provider?: string;
  external_id?: string;
  pix_qr_code?: string;
  pix_copy_paste?: string;
  pix_expiration?: string;
  card_brand?: string;
  card_last4?: string;
  payload?: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  cancelled_at?: string;
  refunded_at?: string;
}

export interface PaymentSplit {
  id: string;
  sale_id: string;
  payment_id?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  store_id: string;
  product_id: string;
  variant_id?: string;
  type: StockMovementType;
  quantity: number;
  balance_before?: number;
  balance_after?: number;
  reference_type?: string;
  reference_id?: string;
  reason?: string;
  notes?: string;
  user_id?: string;
  unit_cost?: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Expense {
  id: string;
  store_id: string;
  category: ExpenseCategory;
  subcategory?: string;
  description: string;
  amount: number;
  payment_method?: PaymentMethod;
  payment_date: string;
  is_recurring: boolean;
  recurrence_interval?: string;
  recurrence_end_date?: string;
  supplier_name?: string;
  supplier_cnpj?: string;
  invoice_number?: string;
  invoice_url?: string;
  is_paid: boolean;
  metadata: Record<string, any>;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Receipt {
  id: string;
  sale_id: string;
  receipt_number?: string;
  type?: string;
  url: string;
  pdf_url?: string;
  xml_url?: string;
  is_sent: boolean;
  sent_at?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  store_id?: string;
  type: NotificationType;
  title: string;
  message?: string;
  action_url?: string;
  action_label?: string;
  read: boolean;
  read_at?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Discount {
  id: string;
  store_id: string;
  code: string;
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  applies_to?: string;
  applies_to_ids?: string[];
  usage_limit?: number;
  usage_limit_per_customer?: number;
  current_usage: number;
  starts_at: string;
  ends_at?: string;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DiscountUsage {
  id: string;
  discount_id: string;
  sale_id: string;
  customer_id?: string;
  discount_amount: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  store_id?: string;
  user_id?: string;
  entity_type: string;
  entity_id: string;
  action: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Integration {
  id: string;
  store_id: string;
  provider: string;
  name: string;
  api_key?: string;
  api_secret?: string;
  webhook_secret?: string;
  config: Record<string, any>;
  is_active: boolean;
  last_sync_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// =====================================================
// VIEW TYPES
// =====================================================

export interface StoreAnalytics {
  store_id: string;
  store_name: string;
  total_sales: number;
  total_revenue: number;
  average_ticket: number;
  today_sales: number;
  today_revenue: number;
  month_sales: number;
  month_revenue: number;
  total_products: number;
  total_customers: number;
  inventory_value: number;
}

export interface ProductPerformance {
  product_id: string;
  store_id: string;
  product_name: string;
  sku?: string;
  price: number;
  cost_price?: number;
  stock: number;
  times_sold: number;
  total_quantity_sold: number;
  total_revenue: number;
  total_profit: number;
  last_sold_at?: string;
}

export interface LowStockProduct {
  product_id: string;
  store_id: string;
  product_name: string;
  sku?: string;
  stock: number;
  stock_min: number;
  units_needed: number;
}

// =====================================================
// FUNCTION RESPONSE TYPES
// =====================================================

export interface SalesReportRow {
  period: string;
  sales_count: number;
  revenue: number;
  avg_ticket: number;
  customers_count: number;
}

export interface TopProductRow {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
  sales_count: number;
}

export interface DiscountApplicationResult {
  success: boolean;
  error?: string;
  discount_amount?: number;
  new_total?: number;
  min_amount?: number;
}

// =====================================================
// REQUEST/RESPONSE TYPES FOR API
// =====================================================

export interface CreateSaleRequest {
  store_id: string;
  customer_id?: string;
  items: CreateSaleItemRequest[];
  discount_code?: string;
  notes?: string;
}

export interface CreateSaleItemRequest {
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
}

export interface ProcessPaymentRequest {
  sale_id: string;
  amount: number;
  method: PaymentMethod;
  installments?: number;
  provider?: string;
  external_id?: string;
}

export interface CreateProductRequest {
  store_id: string;
  category_id?: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost_price?: number;
  stock: number;
  description?: string;
  image_url?: string;
  variants?: CreateProductVariantRequest[];
}

export interface CreateProductVariantRequest {
  name: string;
  sku?: string;
  price?: number;
  stock: number;
  option1_name?: string;
  option1_value?: string;
  option2_name?: string;
  option2_value?: string;
}

export interface StockMovementRequest {
  product_id: string;
  variant_id?: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  notes?: string;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type SaleWithItems = Sale & {
  items: SaleItem[];
  payments: Payment[];
  customer?: Customer;
  cashier?: User;
};

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
  category?: Category;
};

export type SaleWithDetails = Sale & {
  items: (SaleItem & {
    product?: Product;
    variant?: ProductVariant;
  })[];
  payments: Payment[];
  customer?: Customer;
  cashier?: User;
  receipts: Receipt[];
};

// =====================================================
// SUPABASE CLIENT TYPES
// =====================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id'>>;
      };
      stores: {
        Row: Store;
        Insert: Omit<Store, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Store, 'id'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id'>>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<
          Customer,
          | 'id'
          | 'created_at'
          | 'updated_at'
          | 'total_spent'
          | 'total_orders'
          | 'average_ticket'
        >;
        Update: Partial<Omit<Customer, 'id'>>;
      };
      sales: {
        Row: Sale;
        Insert: Omit<Sale, 'id' | 'created_at' | 'updated_at' | 'sale_number'>;
        Update: Partial<Omit<Sale, 'id'>>;
      };
      sale_items: {
        Row: SaleItem;
        Insert: Omit<SaleItem, 'id' | 'created_at'>;
        Update: Partial<Omit<SaleItem, 'id'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Payment, 'id'>>;
      };
      // ... add more as needed
    };
    Views: {
      store_analytics: {
        Row: StoreAnalytics;
      };
      product_performance: {
        Row: ProductPerformance;
      };
      low_stock_products: {
        Row: LowStockProduct;
      };
    };
    Functions: {
      is_feature_enabled: {
        Args: { store_uuid: string; feature_key: string };
        Returns: boolean;
      };
      get_product_stock: {
        Args: { product_uuid: string };
        Returns: Record<string, any>;
      };
      calculate_sale_totals: {
        Args: { sale_uuid: string };
        Returns: void;
      };
      process_payment: {
        Args: { payment_uuid: string };
        Returns: void;
      };
      cancel_sale: {
        Args: { sale_uuid: string; cancel_reason?: string };
        Returns: void;
      };
      apply_discount_to_sale: {
        Args: { sale_uuid: string; discount_code: string };
        Returns: DiscountApplicationResult;
      };
      get_sales_report: {
        Args: {
          store_uuid: string;
          start_date?: string;
          end_date?: string;
          group_by?: string;
        };
        Returns: SalesReportRow[];
      };
      get_top_products: {
        Args: {
          store_uuid: string;
          start_date?: string;
          end_date?: string;
          limit_count?: number;
        };
        Returns: TopProductRow[];
      };
    };
  };
}

// =====================================================
// HELPER TYPES
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface SupabaseError {
  message: string;
  details: string;
  hint: string;
  code: string;
}
