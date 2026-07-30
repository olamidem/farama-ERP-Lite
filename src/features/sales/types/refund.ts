export type RefundMethod =
  | "CASH"
  | "WALLET"
  | "STORE_CREDIT"
  | "EXCHANGE";

export interface SaleRefund {
  id: string;
  sale_id: string;
  customer_id?: string;
  amount: number;
  method: RefundMethod;
  reason?: string;
  created_by?: string;
  created_at: string;
}