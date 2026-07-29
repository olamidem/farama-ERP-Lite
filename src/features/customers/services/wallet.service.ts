import { supabase } from "../../../api/supabase";
import type {
  CustomerWallet,
  WalletTransaction,
  WalletDepositInput,
  WalletWithdrawalInput,
  WalletSalePaymentInput,
  WalletRefundInput,
  WalletAdjustmentInput,
  WalletOverviewStats,
  WalletStatus,
} from "../types";

export const getWalletByCustomerId = async (
  customerId: string
): Promise<CustomerWallet> => {
  const { data, error } = await supabase
    .from("customer_wallets")
    .select("*")
    .eq("customer_id", customerId)
    .single();

  if (error) throw error;

  return data;
};

export const getAllWallets = async (): Promise<CustomerWallet[]> => {
  const { data, error } = await supabase
    .from("customer_wallets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
};

export const getWalletTransactions = async (
  customerId: string
): Promise<WalletTransaction[]> => {
  const { data, error } = await supabase
    .from("customer_wallet_transactions")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
};

export const getAllWalletTransactions = async (): Promise<
  WalletTransaction[]
> => {
  const { data, error } = await supabase
    .from("customer_wallet_transactions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
};

/* -------------------------------------------------------------------------- */
/* Wallet Actions */
/* -------------------------------------------------------------------------- */

export const depositToWallet = async (
  input: WalletDepositInput
): Promise<WalletTransaction> => {
  const { data, error } = await supabase.rpc("wallet_deposit", {
    p_customer_id: input.customer_id,
    p_amount: input.amount,
    p_payment_method: input.payment_method,
    p_notes: input.notes ?? null,
    p_reference: input.reference ?? null,
    p_performed_by: input.performed_by ?? null,
  });

  if (error) throw error;

  return data;
};

export const withdrawFromWallet = async (
  input: WalletWithdrawalInput
): Promise<WalletTransaction> => {
  const { data, error } = await supabase.rpc("wallet_withdraw", {
    p_customer_id: input.customer_id,
    p_amount: input.amount,
    p_payment_method: input.payment_method,
    p_notes: input.notes ?? null,
    p_reference: input.reference ?? null,
    p_performed_by: input.performed_by ?? null,
  });

  if (error) throw error;

  return data;
};

export const payWithWallet = async (
  input: WalletSalePaymentInput
): Promise<WalletTransaction> => {
  const { data, error } = await supabase.rpc("wallet_sale_payment", {
    p_customer_id: input.customer_id,
    p_sale_id: input.sale_id ?? null,
    p_amount: input.amount,
    p_reference: input.reference ?? null,
    p_notes: input.notes ?? null,
    p_performed_by: input.performed_by ?? null,
  });

  if (error) throw error;

  return data;
};

export const refundToWallet = async (
  input: WalletRefundInput
): Promise<WalletTransaction> => {
  const { data, error } = await supabase.rpc("wallet_refund", {
    p_customer_id: input.customer_id,
    p_sale_id: input.sale_id ?? null,
    p_amount: input.amount,
    p_reference: input.reference ?? null,
    p_notes: input.notes ?? null,
    p_performed_by: input.performed_by ?? null,
  });

  if (error) throw error;

  return data;
};

export const adjustWallet = async (
  input: WalletAdjustmentInput
): Promise<WalletTransaction> => {
  const { data, error } = await supabase.rpc("wallet_adjustment", {
    p_customer_id: input.customer_id,
    p_amount: input.amount,
    p_direction: input.direction,
    p_notes: input.notes,
    p_performed_by: input.performed_by ?? null,
  });

  if (error) throw error;

  return data;
};

export const transferWalletBalance = async (input: {
  senderId: string;
  recipientId: string;
  amount: number;
  notes?: string;
}): Promise<void> => {
  const { error } = await supabase.rpc("wallet_transfer", {
    p_sender: input.senderId,
    p_recipient: input.recipientId,
    p_amount: input.amount,
    p_notes: input.notes ?? null,
  });

  if (error) throw error;
};

/* -------------------------------------------------------------------------- */
/* Wallet Status */
/* -------------------------------------------------------------------------- */

export const updateWalletStatus = async (
  customerId: string,
  status: WalletStatus
): Promise<CustomerWallet> => {
  const { data, error } = await supabase
    .from("customer_wallets")
    .update({ status })
    .eq("customer_id", customerId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

/* -------------------------------------------------------------------------- */
/* Dashboard */
/* -------------------------------------------------------------------------- */

export const getWalletOverviewStats =
  async (): Promise<WalletOverviewStats> => {
    const { data, error } = await supabase.rpc(
      "wallet_overview_stats"
    );

    if (error) throw error;

    return data;
  };