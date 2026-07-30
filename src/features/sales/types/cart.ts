export type CartStatus =
  | "ACTIVE"
  | "HELD"
  | "COMPLETED"
  | "ABANDONED";

export interface CartItem {
  id?: string;
  cart_id?: string;
  product_id: string;
  product_unit_id: string;
  name: string;
  unit_name: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  max_stock: number;
  conversion_factor: number;
  created_at?: string;
}

export interface Cart {
  id?: string;
  cart_number?: string;
  customer_id?: string | null;
  cashier_id?: string | null;
  status: CartStatus;
  notes?: string | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  items: CartItem[];
  created_at?: string;
  updated_at?: string;
}

export interface HoldCartInput {
  customer_id?: string | null;
  notes?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  items: CartItem[];
}