import type { PaymentMethod } from "./payment";
export type { ReceiptData, ReceiptItem } from "./receipt";
export type { SalesStats } from "./stats";

export type SaleStatus =
  | "PENDING"
  | "PAID"
  | "PARTIALLY_PAID"
  | "REFUNDED"
  | "CANCELLED"
  | "COMPLETED";

export interface POSProductUnit {
  id: string;
  product_id: string;
  unit_id: string;
  conversion_factor: number;
  selling_price: number;
  cost_price: number;
  is_base_unit?: boolean;
  is_default?: boolean;
  unit?: {
    id?: string;
    name: string;
    symbol?: string;
  };
}

export interface POSProduct {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  selling_price: number;
  cost_price: number;
  stock: number;
  category_id?: string;
  base_unit_id?: string;
  is_active?: boolean;
  category?: {
    id: string;
    name: string;
  };
  units?: POSProductUnit[];
}

export interface SaleItem {
  id?: string;
  sale_id?: string;
  product_id: string;
  product_unit_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
  line_total: number;
  total_price?: number;
  cost_price: number;
  created_at?: string;
  product?: {
    id?: string;
    name: string;
    sku?: string;
  };
  product_unit?: {
    id?: string;
    unit_name?: string;
    name?: string;
    unit?: {
      id?: string;
      name: string;
      symbol?: string;
    };
  };
}

export interface SalePayment {
  id?: string;
  sale_id: string;
  customer_id?: string | null;
  amount: number;
  payment_method: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
  performed_by?: string | null;
  created_at?: string;
  performer?: {
    full_name?: string;
    email?: string;
  } | null;
}

export interface Sale {
  id: string;
  sale_number: string;
  cart_id?: string | null;
  customer_id?: string | null;
  customer_name?: string;
  customer_phone?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount?: number;
  payable_amount: number;
  amount_paid: number;
  balance_due: number;
  payment_method: PaymentMethod;
  status: SaleStatus;
  remarks?: string;
  created_by?: string | null;
  created_at: string;
  updated_at?: string;
  items?: SaleItem[];
  payments?: SalePayment[];
}

export interface CreateSaleItemInput {
  product_id: string;
  product_unit_id: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  discount?: number;
  tax?: number;
  total_price?: number;
}

export interface CreateSaleInput {
  cart_id?: string | null;
  customer_id?: string | null;
  customer_name?: string;
  customer_phone?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount?: number;
  payable_amount: number;
  amount_paid: number;
  payment_method: PaymentMethod;
  remarks?: string;
  notes?: string;
  items: CreateSaleItemInput[];
}
