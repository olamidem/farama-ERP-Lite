import { supabase } from "../../../../api/supabase";
import type {
  WalletDepositInput,
  WalletWithdrawalInput,
  WalletAdjustmentInput,
  WalletTransaction,
  CustomerWallet,
} from "../../../customers/types/wallet";

/* -------------------------------------------------------------------------- */
/* Wallet                                                                     */
/* -------------------------------------------------------------------------- */

export async function getWallet(
  customerId: string
): Promise<CustomerWallet | null> {
  const { data, error } = await supabase
    .from("customer_wallets")
    .select("*")
    .eq("customer_id", customerId)
    .maybeSingle();

  if (error) throw error;

  return data;
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
  transaction: Partial<WalletTransaction>
) {
  const { error } = await supabase
    .from("wallet_transactions")
    .insert(transaction);

  if (error) throw error;
}

/* -------------------------------------------------------------------------- */
/* Deposit                                                                    */
/* -------------------------------------------------------------------------- */

export async function deposit(
  input: WalletDepositInput
) {
  await assertWalletActive(input.customer_id);

  const before = await getWalletBalance(
    input.customer_id
  );

  const after = before + input.amount;

  await updateBalance(input.customer_id, after);

  await recordTransaction({
    wallet_id: input.customer_id,
    type: "DEPOSIT",
    direction: "CREDIT",
    amount: input.amount,
    balance_before: before,
    balance_after: after,
    payment_method: input.payment_method,
    reference: input.reference,
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

  const before = await getWalletBalance(
    input.customer_id
  );

  if (before < input.amount) {
    throw new Error("Insufficient wallet balance.");
  }

  const after = before - input.amount;

  await updateBalance(input.customer_id, after);

  await recordTransaction({
    wallet_id: input.customer_id,
    type: "WITHDRAWAL",
    direction: "DEBIT",
    amount: input.amount,
    balance_before: before,
    balance_after: after,
    payment_method: input.payment_method,
    reference: input.reference,
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
  return withdraw({
    customer_id,
    amount,
    payment_method: "WALLET",
    reference: reference || sale_id,
    notes,
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
  return deposit({
    customer_id,
    amount,
    payment_method: "WALLET",
    reference: reference || sale_id,
    notes,
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
  await withdraw({
    customer_id: senderId,
    amount,
    payment_method: "WALLET",
    notes: `Transfer to ${receiverId}`,
  });

  await deposit({
    customer_id: receiverId,
    amount,
    payment_method: "WALLET",
    notes: `Transfer from ${senderId}`,
  });
}

/* -------------------------------------------------------------------------- */
/* Manual Adjustment                                                          */
/* -------------------------------------------------------------------------- */

export async function adjustWallet(
  input: WalletAdjustmentInput
) {
  if (input.direction === "CREDIT") {
    return deposit({
      customer_id: input.customer_id,
      amount: input.amount,
      payment_method: "OTHER",
      notes: input.notes,
      performed_by: input.performed_by,
    });
  }

  return withdraw({
    customer_id: input.customer_id,
    amount: input.amount,
    payment_method: "OTHER",
    notes: input.notes,
    performed_by: input.performed_by,
  });
}

export const depositToWallet = deposit;
export const withdrawFromWallet = withdraw;
