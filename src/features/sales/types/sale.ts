import type { PaymentMethod } from "./payment";

export type SaleStatus =
  | "PENDING"
  | "PAID"
  | "PARTIALLY_PAID"
  | "REFUNDED"
  | "CANCELLED";

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
  cost_price: number;
  created_at?: string;
}

export interface Sale {
  id: string;
  sale_number: string;
  cart_id?: string | null;
  customer_id?: string | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
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
}

export interface CreateSaleItemInput {
  product_id: string;
  product_unit_id: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  discount?: number;
  tax?: number;
}

export interface CreateSaleInput {
  cart_id?: string;
  customer_id?: string | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  payable_amount: number;
  amount_paid: number;
  payment_method: PaymentMethod;
  remarks?: string;
  items: CreateSaleItemInput[];
}