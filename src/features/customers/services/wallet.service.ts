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
/* Helper for direct database updates when RPC is missing or fails */
/* -------------------------------------------------------------------------- */

async function updateBalancesAndRecordTx({
  customerId,
  amount,
  type,
  direction,
  paymentMethod,
  notes,
  reference,
  performedBy,
}: {
  customerId: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL" | "SALE_PAYMENT" | "REFUND" | "ADJUSTMENT";
  direction: "CREDIT" | "DEBIT";
  paymentMethod: string;
  notes?: string | null;
  reference?: string | null;
  performedBy?: string | null;
}): Promise<WalletTransaction> {
  // 1. Fetch current balances
  const { data: custData } = await supabase
    .from("customers")
    .select("wallet_balance")
    .eq("id", customerId)
    .single();

  const { data: walletData } = await supabase
    .from("customer_wallets")
    .select("id, balance")
    .eq("customer_id", customerId)
    .maybeSingle();

  const currentBalance = walletData?.balance ?? custData?.wallet_balance ?? 0;

  // 2. Calculate new balance
  let newBalance: number;
  if (direction === "CREDIT") {
    newBalance = currentBalance + amount;
  } else {
    if (currentBalance < amount && type === "WITHDRAWAL") {
      throw new Error(
        `Insufficient wallet balance. Current balance is ₦${currentBalance.toLocaleString()}`
      );
    }
    newBalance = Math.max(0, currentBalance - amount);
  }

  // 3. Update customers table
  await supabase
    .from("customers")
    .update({
      wallet_balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  // 4. Update or Insert customer_wallets table
  let walletId = walletData?.id;
  if (walletData) {
    await supabase
      .from("customer_wallets")
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("customer_id", customerId);
  } else {
    const { data: newWal } = await supabase
      .from("customer_wallets")
      .insert({
        customer_id: customerId,
        balance: newBalance,
        status: "ACTIVE",
      })
      .select("id")
      .single();

    if (newWal) {
      walletId = newWal.id;
    }
  }

  // 5. Insert transaction into customer_wallet_transactions
  const now = new Date().toISOString();
  const txRef =
    reference || `${type.slice(0, 3)}-${Date.now().toString().slice(-6)}`;
  const txData = {
    customer_id: customerId,
    wallet_id: walletId || `wal-${customerId}`,
    reference: txRef,
    type,
    direction,
    amount,
    balance_before: currentBalance,
    balance_after: newBalance,
    payment_method: paymentMethod || "CASH",
    notes: notes || null,
    performed_by: performedBy || "System",
    created_at: now,
  };

  const { data: insertedTx, error: txErr } = await supabase
    .from("customer_wallet_transactions")
    .insert(txData)
    .select()
    .single();

  if (txErr || !insertedTx) {
    return {
      id: `tx-${Date.now()}`,
      ...txData,
    } as WalletTransaction;
  }

  return insertedTx as WalletTransaction;
}

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

  return updateBalancesAndRecordTx({
    customerId: input.customer_id,
    amount: input.amount,
    type: "DEPOSIT",
    direction: "CREDIT",
    paymentMethod: input.payment_method,
    notes: input.notes,
    reference: input.reference,
    performedBy: input.performed_by,
  });
};

export const withdrawFromWallet = async (
  input: WalletWithdrawalInput
): Promise<WalletTransaction> => {
  await assertWalletActive(input.customer_id);

  return updateBalancesAndRecordTx({
    customerId: input.customer_id,
    amount: input.amount,
    type: "WITHDRAWAL",
    direction: "DEBIT",
    paymentMethod: input.payment_method,
    notes: input.notes,
    reference: input.reference,
    performedBy: input.performed_by,
  });
};

export const payWithWallet = async (
  input: WalletSalePaymentInput
): Promise<WalletTransaction> => {
  await assertWalletActive(input.customer_id);

  return updateBalancesAndRecordTx({
    customerId: input.customer_id,
    amount: input.amount,
    type: "SALE_PAYMENT",
    direction: "DEBIT",
    paymentMethod: "WALLET",
    notes: input.notes || `Sale payment`,
    reference: input.reference,
    performedBy: input.performed_by,
  });
};

export const refundToWallet = async (
  input: WalletRefundInput
): Promise<WalletTransaction> => {
  await assertWalletActive(input.customer_id);

  return updateBalancesAndRecordTx({
    customerId: input.customer_id,
    amount: input.amount,
    type: "REFUND",
    direction: "CREDIT",
    paymentMethod: "WALLET",
    notes: input.notes || `Sale refund`,
    reference: input.reference,
    performedBy: input.performed_by,
  });
};

export const adjustWallet = async (
  input: WalletAdjustmentInput
): Promise<WalletTransaction> => {
  await assertWalletActive(input.customer_id);

  return updateBalancesAndRecordTx({
    customerId: input.customer_id,
    amount: input.amount,
    type: "ADJUSTMENT",
    direction: input.direction,
    paymentMethod: "OTHER",
    notes: input.notes || "Balance adjustment",
    performedBy: input.performed_by,
  });
};

export const transferWalletBalance = async (input: {
  senderId: string;
  recipientId: string;
  amount: number;
  notes?: string;
}): Promise<void> => {
  await assertWalletActive(input.senderId);
  await assertWalletActive(input.recipientId);

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
  };
