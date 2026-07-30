export type PaymentMethod =
  | "CASH"
  | "POS"
  | "CARD"
  | "BANK_TRANSFER"
  | "WALLET"
  | "SPLIT";

export interface SplitPayment {
  method: Exclude<PaymentMethod, "SPLIT">;
  amount: number;
  reference?: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  amountPaid: number;
  receivedAmount: number;
  changeDue: number;
  reference?: string;
  notes?: string;
  splitPayments?: SplitPayment[];
}