import type { PaymentMethod } from "./payment";

export interface SalePayment {
  id: string;
  sale_id: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  created_by?: string;
  created_at: string;
}