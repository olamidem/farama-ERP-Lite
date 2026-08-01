import { supabase } from "../../../../api/supabase";
import type {
  WalletDepositInput,
  WalletWithdrawalInput,
  WalletAdjustmentInput,
  WalletTransaction,
  CustomerWallet,
} from "../../../customers/types/wallet";

/* -------------------------------------------------------------------------- */
/* Wallet Helper                                                              */
/* -------------------------------------------------------------------------- */

export async function getOrCreateWallet(
  customerId: string
): Promise<CustomerWallet> {
  const { data: existing } = await supabase
    .from("customer_wallets")
    .select("*")
    .eq("customer_id", customerId)
    .maybeSingle();

  if (existing?.id) {
    return existing as CustomerWallet;
  }

  // Insert customer wallet if not exists
  const { data: created } = await supabase
    .from("customer_wallets")
    .insert({
      customer_id: customerId,
      balance: 0,
      currency: "NGN",
      status: "ACTIVE",
    })
    .select("*")
    .maybeSingle();

  if (created?.id) {
    return created as CustomerWallet;
  }

  // Refetch
  const { data: refetched } = await supabase
    .from("customer_wallets")
    .select("*")
    .eq("customer_id", customerId)
    .maybeSingle();

  if (refetched?.id) {
    return refetched as CustomerWallet;
  }

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

export async function getWallet(
  customerId: string
): Promise<CustomerWallet | null> {
  return getOrCreateWallet(customerId);
}

/* -------------------------------------------------------------------------- */

export async function getWalletBalance(
  customerId: string
): Promise<number> {
  const wallet = await getWallet(customerId);

  return Number(wallet?.balance ?? 0);
}

/* -------------------------------------------------------------------------- */

export async function assertWalletActive(
  customerId: string
): Promise<void> {
  const wallet = await getWallet(customerId);

  if (!wallet) {
    throw new Error("Customer wallet does not exist.");
  }

  if (wallet.status === "SUSPENDED") {
    throw new Error(
      "Customer wallet has been suspended."
    );
  }
}

/* -------------------------------------------------------------------------- */

export async function hasEnoughBalance(
  customerId: string,
  amount: number
): Promise<boolean> {
  const balance = await getWalletBalance(customerId);

  return balance >= amount;
}

/* -------------------------------------------------------------------------- */
/* Update Balance                                                             */
/* -------------------------------------------------------------------------- */

async function updateBalance(
  customerId: string,
  newBalance: number
) {
  const { error } = await supabase
    .from("customer_wallets")
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("customer_id", customerId);

  if (error) throw error;
}

/* -------------------------------------------------------------------------- */
/* Record Transaction                                                         */
/* -------------------------------------------------------------------------- */

async function recordTransaction(
  transaction: Partial<WalletTransaction> & { customer_id?: string }
) {
  const ref =
    transaction.reference ||
    `REF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  let walletId = transaction.wallet_id;
  if ((!walletId || walletId.startsWith("wal-")) && transaction.customer_id) {
    const wallet = await getOrCreateWallet(transaction.customer_id);
    walletId = wallet.id;
  }

  const txPayload: Record<string, unknown> = {
    reference: ref,
    type: transaction.type || "ADJUSTMENT",
    direction: transaction.direction || "CREDIT",
    amount: transaction.amount || 0,
    balance_before: transaction.balance_before || 0,
    balance_after: transaction.balance_after || 0,
    payment_method: transaction.payment_method || "WALLET",
    notes: transaction.notes || null,
    created_at: new Date().toISOString(),
  };

  if (walletId && !walletId.startsWith("wal-")) {
    txPayload.wallet_id = walletId;
  }

  if (transaction.performed_by) {
    txPayload.performed_by = transaction.performed_by;
  }

  const { error } = await supabase
    .from("wallet_transactions")
    .insert(txPayload);

  if (error) {
    console.warn("Insert into wallet_transactions error:", error.message);
  }
}

/* -------------------------------------------------------------------------- */
/* Deposit                                                                    */
/* -------------------------------------------------------------------------- */

export async function deposit(
  input: WalletDepositInput
) {
  await assertWalletActive(input.customer_id);
  const wallet = await getOrCreateWallet(input.customer_id);

  const before = Number(wallet.balance || 0);
  const after = before + input.amount;

  await updateBalance(input.customer_id, after);

  const ref =
    input.reference ||
    `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  await recordTransaction({
    wallet_id: wallet.id,
    customer_id: input.customer_id,
    type: "DEPOSIT",
    direction: "CREDIT",
    amount: input.amount,
    balance_before: before,
    balance_after: after,
    payment_method: input.payment_method || "CASH",
    reference: ref,
    notes: input.notes,
    performed_by: input.performed_by,
  });

  return after;
}

/* -------------------------------------------------------------------------- */
/* Withdraw                                                                   */
/* -------------------------------------------------------------------------- */

export async function withdraw(
  input: WalletWithdrawalInput
) {
  await assertWalletActive(input.customer_id);
  const wallet = await getOrCreateWallet(input.customer_id);

  const before = Number(wallet.balance || 0);

  if (before < input.amount) {
    throw new Error(
      `Insufficient wallet balance. Current balance is ₦${before.toLocaleString()}`
    );
  }

  const after = before - input.amount;

  await updateBalance(input.customer_id, after);

  const ref =
    input.reference ||
    `WTH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  await recordTransaction({
    wallet_id: wallet.id,
    customer_id: input.customer_id,
    type: "WITHDRAWAL",
    direction: "DEBIT",
    amount: input.amount,
    balance_before: before,
    balance_after: after,
    payment_method: input.payment_method || "WALLET",
    reference: ref,
    notes: input.notes,
    performed_by: input.performed_by,
  });

  return after;
}

/* -------------------------------------------------------------------------- */
/* Sale Payment                                                               */
/* -------------------------------------------------------------------------- */

export async function payWithWallet({
  customer_id,
  amount,
  sale_id,
  reference,
  notes,
  performed_by,
}: {
  customer_id: string;
  amount: number;
  sale_id: string;
  reference?: string;
  notes?: string;
  performed_by?: string;
}) {
  const ref =
    reference ||
    `SALE-${sale_id ? sale_id.slice(-8) : Date.now()}-${Math.random().toString(36).substring(2, 5)}`;

  return withdraw({
    customer_id,
    amount,
    payment_method: "WALLET",
    reference: ref,
    notes: notes || `Purchase payment for sale #${sale_id}`,
    performed_by,
  });
}

/* -------------------------------------------------------------------------- */
/* Refund                                                                     */
/* -------------------------------------------------------------------------- */

export async function refundToWallet({
  customer_id,
  amount,
  sale_id,
  reference,
  notes,
  performed_by,
}: {
  customer_id: string;
  amount: number;
  sale_id: string;
  reference?: string;
  notes?: string;
  performed_by?: string;
}) {
  const ref =
    reference ||
    `REFUND-${sale_id ? sale_id.slice(-8) : Date.now()}-${Math.random().toString(36).substring(2, 5)}`;

  return deposit({
    customer_id,
    amount,
    payment_method: "WALLET",
    reference: ref,
    notes: notes || `Refund for sale #${sale_id}`,
    performed_by,
  });
}

/* -------------------------------------------------------------------------- */
/* Transfer                                                                   */
/* -------------------------------------------------------------------------- */

export async function transferWallet(
  senderId: string,
  receiverId: string,
  amount: number
) {
  const ref = `TRF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  await withdraw({
    customer_id: senderId,
    amount,
    payment_method: "WALLET",
    reference: `${ref}-OUT`,
    notes: `Transfer to customer ${receiverId}`,
  });

  await deposit({
    customer_id: receiverId,
    amount,
    payment_method: "WALLET",
    reference: `${ref}-IN`,
    notes: `Transfer from customer ${senderId}`,
  });
}

/* -------------------------------------------------------------------------- */
/* Manual Adjustment                                                          */
/* -------------------------------------------------------------------------- */

export async function adjustWallet(
  input: WalletAdjustmentInput
) {
  const ref =
    input.reference ||
    `ADJ-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  if (input.direction === "CREDIT") {
    return deposit({
      customer_id: input.customer_id,
      amount: input.amount,
      payment_method: "OTHER",
      reference: ref,
      notes: input.notes,
      performed_by: input.performed_by,
    });
  }

  return withdraw({
    customer_id: input.customer_id,
    amount: input.amount,
    payment_method: "OTHER",
    reference: ref,
    notes: input.notes,
    performed_by: input.performed_by,
  });
}

export const depositToWallet = deposit;
export const withdrawFromWallet = withdraw;

