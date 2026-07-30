import { supabase } from "../../../api/supabase";
import type {
  CustomerWallet,
  WalletTransaction,
  WalletDepositInput,
  WalletWithdrawalInput,
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

function isUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
}

export const getWalletTransactions = async (
  customerId: string
): Promise<WalletTransaction[]> => {
  const { data: wallet } = await supabase
    .from("customer_wallets")
    .select("id")
    .eq("customer_id", customerId)
    .maybeSingle();

  if (wallet?.id) {
    const { data: wtData, error: wtErr } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("wallet_id", wallet.id)
      .order("created_at", { ascending: false });

    if (!wtErr && wtData && wtData.length > 0) {
      return wtData.map((t: Record<string, unknown>) => ({
        ...t,
        customer_id: customerId,
      })) as unknown as WalletTransaction[];
    }
  }

  const { data } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("wallet_id", wallet?.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as WalletTransaction[];
};

export const getAllWalletTransactions = async (): Promise<
  WalletTransaction[]
> => {
  const { data: wtData } = await supabase
    .from("wallet_transactions")
    .select("*")
    .order("created_at", { ascending: false });

  return (wtData ?? []) as unknown as WalletTransaction[];
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
  if (!isUUID(customerId)) {
    console.warn("Skipping DB wallet transaction for non-UUID customerId:", customerId);
    return {
      id: `tx-${Date.now()}`,
      customer_id: customerId,
      reference: reference || `REF-${Date.now()}`,
      type,
      direction,
      amount,
      balance_before: 0,
      balance_after: 0,
      payment_method: paymentMethod || "WALLET",
      created_at: new Date().toISOString(),
    } as unknown as WalletTransaction;
  }

  // 1. Fetch current wallet balance
  const { data: walletData } = await supabase
    .from("customer_wallets")
    .select("id, balance")
    .eq("customer_id", customerId)
    .maybeSingle();

  const currentBalance = Number(walletData?.balance || 0);

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

  // 3. Update or Insert customer_wallets table
  let walletId = walletData?.id;
  if (walletData) {
    await supabase
      .from("customer_wallets")
      .update({
        balance: newBalance,
      })
      .eq("customer_id", customerId);
  } else {
    const { data: newWal } = await supabase
      .from("customer_wallets")
      .insert({
        customer_id: customerId,
        balance: newBalance,
        currency: "NGN",
        status: "ACTIVE",
      })
      .select("id")
      .maybeSingle();

    if (newWal?.id) {
      walletId = newWal.id;
    } else {
      const { data: refetched } = await supabase
        .from("customer_wallets")
        .select("id")
        .eq("customer_id", customerId)
        .maybeSingle();
      if (refetched?.id) {
        walletId = refetched.id;
      }
    }
  }

  // 4. Insert transaction into wallet_transactions
  const now = new Date().toISOString();
  const txRef =
    reference || `${type.slice(0, 3)}-${Date.now().toString().slice(-6)}`;

  const txData: Record<string, unknown> = {
    reference: txRef,
    type,
    direction,
    amount,
    balance_before: currentBalance,
    balance_after: newBalance,
    payment_method: paymentMethod || "WALLET",
    notes: notes || null,
    created_at: now,
  };

  if (walletId) {
    txData.wallet_id = walletId;
  }
  if (isUUID(performedBy)) {
    txData.performed_by = performedBy;
  }

  const { data: wtTx, error: wtErr } = await supabase
    .from("wallet_transactions")
    .insert(txData)
    .select()
    .single();

  if (!wtErr && wtTx) {
    return {
      ...wtTx,
      customer_id: customerId,
    } as unknown as WalletTransaction;
  }

  console.warn("Insert into wallet_transactions failed:", wtErr);

  // Fallback: Try minimal payload
  const minimalTx: Record<string, unknown> = {
    reference: txRef,
    type,
    direction,
    amount,
    balance_before: currentBalance,
    balance_after: newBalance,
    created_at: now,
  };
  if (walletId) {
    minimalTx.wallet_id = walletId;
  }

  const { data: fbWtData } = await supabase
    .from("wallet_transactions")
    .insert(minimalTx)
    .select()
    .single();

  if (fbWtData) {
    return {
      ...fbWtData,
      customer_id: customerId,
    } as unknown as WalletTransaction;
  }

  return {
    id: `tx-${Date.now()}`,
    customer_id: customerId,
    wallet_id: walletId || `wal-${customerId}`,
    ...txData,
  } as unknown as WalletTransaction;
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
    const [wallets, txs] = await Promise.all([
      getAllWallets(),
      getAllWalletTransactions(),
    ]);

    const activeWalletsCount = wallets.filter((w) => w.status === "ACTIVE").length;
    const suspendedWalletsCount = wallets.filter((w) => w.status === "SUSPENDED").length;

    // Sum balances across customer_wallets
    const totalWalletBalance = wallets.reduce(
      (sum: number, w) => sum + Number(w.balance || 0),
      0
    );

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayTxs = txs.filter((t) => new Date(t.created_at) >= startOfToday);

    const depositsToday = todayTxs
      .filter((t) => t.type === "DEPOSIT")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const withdrawalsToday = todayTxs
      .filter((t) => t.type === "WITHDRAWAL")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const walletPaymentsToday = todayTxs
      .filter((t) => t.type === "SALE_PAYMENT")
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    return {
      totalWalletBalance,
      activeWallets: activeWalletsCount,
      suspendedWallets: suspendedWalletsCount,
      depositsToday,
      withdrawalsToday,
      walletPaymentsToday,
      totalTransactionsToday: todayTxs.length,
      totalDeposits: txs
        .filter((t) => t.type === "DEPOSIT")
        .reduce((s, t) => s + Number(t.amount || 0), 0),
      totalWithdrawals: txs
        .filter((t) => t.type === "WITHDRAWAL")
        .reduce((s, t) => s + Number(t.amount || 0), 0),
    };
  };