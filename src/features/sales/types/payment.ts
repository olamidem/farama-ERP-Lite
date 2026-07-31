export type PaymentMethod =
  | "CASH"
  | "POS"
  | "CARD"
  | "BANK_TRANSFER"
  | "TRANSFER"
  | "WALLET"
  | "DEPOSIT"
  | "SPLIT";

export interface SplitPayment {
  method: Exclude<PaymentMethod, "SPLIT">;
  amount: number;
  reference?: string;
}

export type SplitPaymentDetail = SplitPayment;

export interface PaymentDetails {
  method: PaymentMethod;
  amountPaid: number;
  receivedAmount: number;
  changeDue: number;
  reference?: string;
  notes?: string;
  splitPayments?: SplitPayment[];
}
