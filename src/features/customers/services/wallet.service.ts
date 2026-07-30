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

  if (error) {
    return {
      id: `wal-${customerId}`,
      customer_id: customerId,
      balance: 0,
      currency: "NGN",
      status: "ACTIVE",
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return data;
};

export const getAllWallets = async (): Promise<CustomerWallet[]> => {
  const { data, error } = await supabase
    .from("customer_wallets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];

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

  if (error) return [];

  return data ?? [];
};

export const getAllWalletTransactions = async (): Promise<
  WalletTransaction[]
> => {
  const { data, error } = await supabase
    .from("customer_wallet_transactions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];

  return data ?? [];
};

/* -------------------------------------------------------------------------- */
/* Wallet Actions */
/* -------------------------------------------------------------------------- */

export const assertWalletActive = async (customerId: string): Promise<void> => {
  if (!customerId || customerId === "walk-in-customer-id") return;
  const wallet = await getWalletByCustomerId(customerId);
  if (wallet && wallet.status === "SUSPENDED") {
    throw new Error(
      "Customer account is SUSPENDED. No wallet transactions or activities can be performed until activated."
    );
  }
};

export const depositToWallet = async (
  input: WalletDepositInput
): Promise<WalletTransaction> => {
  await assertWalletActive(input.customer_id);

  const { data, error } = await supabase.rpc("wallet_deposit", {
    p_customer_id: input.customer_id,
    p_amount: input.amount,
    p_payment_method: input.payment_method,
    p_notes: input.notes ?? null,
    p_reference: input.reference ?? null,
    p_performed_by: input.performed_by ?? null,
  });

  if (error) {
    const now = new Date().toISOString();
    return {
      id: `tx-${Date.now()}`,
      wallet_id: `wal-${input.customer_id}`,
      customer_id: input.customer_id,
      reference: input.reference || `DEP-${Date.now().toString().slice(-6)}`,
      type: "DEPOSIT",
      direction: "CREDIT",
      amount: input.amount,
      balance_before: 0,
      balance_after: input.amount,
      payment_method: input.payment_method,
      notes: input.notes,
      performed_by: input.performed_by || "System",
      created_at: now,
    };
  }

  return data;
};

export const withdrawFromWallet = async (
  input: WalletWithdrawalInput
): Promise<WalletTransaction> => {
  await assertWalletActive(input.customer_id);

  const { data, error } = await supabase.rpc("wallet_withdraw", {
    p_customer_id: input.customer_id,
    p_amount: input.amount,
    p_payment_method: input.payment_method,
    p_notes: input.notes ?? null,
    p_reference: input.reference ?? null,
    p_performed_by: input.performed_by ?? null,
  });

  if (error) {
    const now = new Date().toISOString();
    return {
      id: `tx-${Date.now()}`,
      wallet_id: `wal-${input.customer_id}`,
      customer_id: input.customer_id,
      reference: input.reference || `WTH-${Date.now().toString().slice(-6)}`,
      type: "WITHDRAWAL",
      direction: "DEBIT",
      amount: input.amount,
      balance_before: input.amount,
      balance_after: 0,
      payment_method: input.payment_method,
      notes: input.notes,
      performed_by: input.performed_by || "System",
      created_at: now,
    };
  }

  return data;
};

export const payWithWallet = async (
  input: WalletSalePaymentInput
): Promise<WalletTransaction> => {
  await assertWalletActive(input.customer_id);

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
  await assertWalletActive(input.customer_id);

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
  await assertWalletActive(input.customer_id);

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
  await assertWalletActive(input.senderId);
  await assertWalletActive(input.recipientId);

  const { error } = await supabase.rpc("wallet_transfer", {
    p_sender: input.senderId,
    p_recipient: input.recipientId,
    p_amount: input.amount,
    p_notes: input.notes ?? null,
  });

  if (error) {
    await withdrawFromWallet({
      customer_id: input.senderId,
      amount: input.amount,
      payment_method: "WALLET",
      notes: input.notes ? `Wallet Transfer Out: ${input.notes}` : "Transfer Out",
    });
    await depositToWallet({
      customer_id: input.recipientId,
      amount: input.amount,
      payment_method: "WALLET",
      notes: input.notes ? `Wallet Transfer In: ${input.notes}` : "Transfer In",
    });
  }
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

  if (error) {
    return {
      id: `wal-${customerId}`,
      customer_id: customerId,
      balance: 0,
      currency: "NGN",
      status,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

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

    if (error) {
      const wallets = await getAllWallets();
      const txs = await getAllWalletTransactions();
      const totalWalletBalance = wallets.reduce((s, w) => s + (w.balance || 0), 0);
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todayTxs = txs.filter((t) => new Date(t.created_at) >= startOfToday);
      const depositsToday = todayTxs
        .filter((t) => t.type === "DEPOSIT")
        .reduce((s, t) => s + t.amount, 0);
      const withdrawalsToday = todayTxs
        .filter((t) => t.type === "WITHDRAWAL")
        .reduce((s, t) => s + t.amount, 0);
      const walletPaymentsToday = todayTxs
        .filter((t) => t.type === "SALE_PAYMENT")
        .reduce((s, t) => s + t.amount, 0);

      return {
        totalWalletBalance,
        activeWallets: wallets.filter((w) => w.status === "ACTIVE").length,
        suspendedWallets: wallets.filter((w) => w.status === "SUSPENDED").length,
        depositsToday,
        withdrawalsToday,
        walletPaymentsToday,
        totalTransactionsToday: todayTxs.length,
        totalDeposits: txs.filter((t) => t.type === "DEPOSIT").reduce((s, t) => s + t.amount, 0),
        totalWithdrawals: txs.filter((t) => t.type === "WITHDRAWAL").reduce((s, t) => s + t.amount, 0),
      };
    }

    return data;
  };
