/*
|--------------------------------------------------------------------------
| Wallet Enums
|--------------------------------------------------------------------------
*/

export type CurrencyCode =
  | "NGN"
  | "USD"
  | "EUR";

export type WalletStatus =
  | "ACTIVE"
  | "SUSPENDED";

export type WalletTransactionDirection =
  | "CREDIT"
  | "DEBIT";

export type WalletTransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "SALE_PAYMENT"
  | "REFUND"
  | "ADJUSTMENT"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "OPENING_BALANCE"
  | "REVERSAL";

export type WalletPaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "CARD"
  | "WALLET"
  | "SYSTEM";

/*
|--------------------------------------------------------------------------
| Wallet Models
|--------------------------------------------------------------------------
*/

export interface CustomerWallet {
  id: string;
  customer_id: string;
  balance: number;
  currency: CurrencyCode;
  status: WalletStatus;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  reference: string;
  type: WalletTransactionType;
  direction: WalletTransactionDirection;
  amount: number;
  balance_before: number;
  balance_after: number;
  payment_method: WalletPaymentMethod;
  sale_id?: string | null;
  performed_by?: string | null;
  notes?: string | null;
  created_at: string;
}

/*
|--------------------------------------------------------------------------
| DTOs
|--------------------------------------------------------------------------
*/

export interface WalletDepositInput {
  wallet_id: string;
  amount: number;
  payment_method: WalletPaymentMethod;
  notes?: string;
  reference?: string;
  performed_by?: string;
}

export interface WalletWithdrawalInput {
  wallet_id: string;
  amount: number;
  payment_method: WalletPaymentMethod;
  notes?: string;
  reference?: string;
  performed_by?: string;
}

export interface WalletSalePaymentInput {
  wallet_id: string;
  sale_id?: string;
  amount: number;
  reference?: string;
  notes?: string;
  performed_by?: string;
}

export interface WalletRefundInput {
  wallet_id: string;
  sale_id?: string;
  amount: number;
  reference?: string;
  notes?: string;
  performed_by?: string;
}

export interface WalletAdjustmentInput {
  wallet_id: string;
  amount: number;
  direction: WalletTransactionDirection;
  notes: string;
  performed_by?: string;
}

/*
|--------------------------------------------------------------------------
| Responses
|--------------------------------------------------------------------------
*/

export interface WalletStatement {
  wallet: CustomerWallet;
  transactions: WalletTransaction[];
  opening_balance: number;
  closing_balance: number;
}

export interface WalletSummary {
  wallet: CustomerWallet;
  total_deposits: number;
  total_withdrawals: number;
  total_sales: number;
  current_balance: number;
}

export interface WalletTransactionResponse {
  data: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
}

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

export interface WalletDashboardStats {
  total_wallet_balance: number;
  deposits_today: number;
  withdrawals_today: number;
  wallet_payments_today: number;
  total_transactions_today: number;
}