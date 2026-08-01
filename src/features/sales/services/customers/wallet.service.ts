import { supabase } from "../../../../api/supabase";
import type {
  WalletDepositInput,
  WalletWithdrawalInput,
  WalletAdjustmentInput,
  WalletTransaction,
  CustomerWallet,
} from "../../../customers/types/wallet";

/* -------------------------------------------------------------------------- */
/*  getOrCreateWallet                                                          */
/*                                                                            */
/*  Idempotently returns the customer's wallet.  We try to fetch first, then  */
/*  insert.  The third branch handles the race-condition window on the UNIQUE  */
/*  constraint (customer_id) where two concurrent calls could both see no     */
/*  wallet and both attempt to insert — the loser refetches instead of        */
/*  returning a fake in-memory object which would break NOT NULL constraints. */
/* -------------------------------------------------------------------------- */

export async function getOrCreateWallet(
  customerId: string
): Promise<CustomerWallet> {
  // 1. Fast path — wallet already exists
  const { data: existing } = await supabase
    .from("customer_wallets")
    .select("*")
    .eq("customer_id", customerId)
    .maybeSingle();

  if (existing?.id) return existing as CustomerWallet;

  // 2. Create — will succeed for the first caller
  const { data: created, error: createError } = await supabase
    .from("customer_wallets")
    .insert({
      customer_id: customerId,
      balance: 0,
      currency: "NGN",
      status: "ACTIVE",
    })
    .select("*")
    .maybeSingle();

  if (created?.id) return created as CustomerWallet;

  // 3. Race-condition fallback — lost the insert race, refetch the winner's row
  const { data: refetched, error: refetchError } = await supabase
    .from("customer_wallets")
    .select("*")
    .eq("customer_id", customerId)
    .maybeSingle();

  if (refetched?.id) return refetched as CustomerWallet;

  // All three paths failed — surface the real Supabase error rather than
  // silently returning a fake wallet (which would cause wallet_id NOT NULL
  // violations when we try to write wallet_transactions).
  const err = createError || refetchError;
  throw new Error(
    err
      ? `Failed to create wallet for customer ${customerId}: ${err.message}`
      : `Failed to create or retrieve wallet for customer ${customerId}`
  );
}

/* -------------------------------------------------------------------------- */
/*  getWallet                                                                  */
/*                                                                            */
/*  Public alias — always auto-creates so callers never get null back.        */
/* -------------------------------------------------------------------------- */

export async function getWallet(
  customerId: string
): Promise<CustomerWallet | null> {
  return getOrCreateWallet(customerId);
}

/* -------------------------------------------------------------------------- */

export async function getWalletBalance(customerId: string): Promise<number> {
  const wallet = await getWallet(customerId);
  return Number(wallet?.balance ?? 0);
}

/* -------------------------------------------------------------------------- */

export async function assertWalletActive(customerId: string): Promise<void> {
  const wallet = await getWallet(customerId);
  if (!wallet) throw new Error("Customer wallet does not exist.");
  if (wallet.status === "SUSPENDED")
    throw new Error("Customer wallet has been suspended.");
}

/* -------------------------------------------------------------------------- */

export async function hasEnoughBalance(
  customerId: string,
  amount: number
): Promise<boolean> {
  return (await getWalletBalance(customerId)) >= amount;
}

/* -------------------------------------------------------------------------- */
/*  updateBalance                                                              */
/*                                                                            */
/*  Private.  Updates the scalar balance on customer_wallets.  Always called  */
/*  immediately before recordTransaction so the two stay in sync.             */
/* -------------------------------------------------------------------------- */

async function updateBalance(customerId: string, newBalance: number) {
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
/*  RecordTransactionInput                                                     */
/*                                                                            */
/*  Internal type for recordTransaction.  We extend the partial WalletTx type */
/*  with a few extra fields that aren't part of the DB row but are needed for */
/*  look-ups (customer_id) and POS linkage (sale_id).                         */
/* -------------------------------------------------------------------------- */

interface RecordTransactionInput extends Partial<WalletTransaction> {
  customer_id?: string;
  /**
   * The sale UUID to store in wallet_transactions.sale_id.
   * Providing this creates an auditable link from every SALE_PAYMENT /
   * REFUND wallet transaction back to the originating sale row.
   */
  sale_id?: string | null;
}

/* -------------------------------------------------------------------------- */
/*  recordTransaction                                                          */
/*                                                                            */
/*  Inserts a single row into wallet_transactions.  Design decisions:          */
/*                                                                            */
/*  - wallet_id is always resolved from the DB before inserting because the   */
/*    column is NOT NULL.  We never skip it.                                  */
/*  - performed_by is always written (null when the system acts, a UUID when  */
/*    a staff member triggers the operation).  Using a conditional `if`        */
/*    previously caused inconsistent nullability — fixed by always setting it. */
/*  - notes always has a meaningful default so the column is never empty.     */
/*  - sale_id is explicitly set (null if not provided) for query-ability.     */
/* -------------------------------------------------------------------------- */

async function recordTransaction(input: RecordTransactionInput) {
  // Always generate a deterministic reference prefix so we can trace the tx
  const ref =
    input.reference ||
    `REF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  // Resolve wallet_id — must be a real DB UUID (NOT NULL constraint)
  let walletId = input.wallet_id;
  if (!walletId && input.customer_id) {
    const wallet = await getOrCreateWallet(input.customer_id);
    walletId = wallet.id;
  }

  if (!walletId) {
    // Defensive guard — should never happen after getOrCreateWallet above
    throw new Error("Cannot record wallet transaction: wallet_id is unknown.");
  }

  const { error } = await supabase.from("wallet_transactions").insert({
    wallet_id: walletId,
    reference: ref,
    type: input.type || "ADJUSTMENT",
    direction: input.direction || "CREDIT",
    amount: input.amount || 0,
    balance_before: input.balance_before ?? 0,
    balance_after: input.balance_after ?? 0,
    payment_method: input.payment_method || "CASH",
    // sale_id: always write the field (null when not a sale payment)
    sale_id: input.sale_id ?? null,
    // performed_by: always write — null means system-initiated
    performed_by: input.performed_by ?? null,
    // notes: always provide a meaningful string, never leave empty
    notes: input.notes || `${input.type || "ADJUSTMENT"} transaction`,
    created_at: new Date().toISOString(),
  });

  if (error) {
    // Log but don't crash — a failed tx log should not roll back the balance
    console.warn("wallet_transactions insert failed:", error.message, error);
  }
}

/* -------------------------------------------------------------------------- */
/*  deposit                                                                    */
/*                                                                            */
/*  Credits the wallet.  Used for: customer deposits, refunds, and opening    */
/*  balance set-up.  Asserts wallet is ACTIVE before mutating.               */
/* -------------------------------------------------------------------------- */

export async function deposit(input: WalletDepositInput) {
  await assertWalletActive(input.customer_id);

  const wallet = await getOrCreateWallet(input.customer_id);
  const before = Number(wallet.balance || 0);
  const after = before + input.amount;

  // Mutate the balance first; if the tx log fails the balance is still correct
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
    notes: input.notes || `Deposit of ₦${input.amount.toLocaleString()}`,
    performed_by: input.performed_by ?? null,
  });

  return after;
}

/* -------------------------------------------------------------------------- */
/*  withdraw                                                                   */
/*                                                                            */
/*  Debits the wallet.  Guards against overdraft.                             */
/* -------------------------------------------------------------------------- */

export async function withdraw(input: WalletWithdrawalInput) {
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
    notes: input.notes || `Withdrawal of ₦${input.amount.toLocaleString()}`,
    performed_by: input.performed_by ?? null,
  });

  return after;
}

/* -------------------------------------------------------------------------- */
/*  payWithWallet                                                              */
/*                                                                            */
/*  Debits the wallet for a POS sale.  The sale_id is stored on the           */
/*  wallet_transaction row so you can audit which sale each debit came from.  */
/*                                                                            */
/*  Previously sale_id was accepted here but never passed into recordTransaction
/*  — that is the root cause of sale_id being NULL in wallet_transactions.    */
/*  Fixed by wiring it through withdraw → recordTransaction.                  */
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
  await assertWalletActive(customer_id);

  const wallet = await getOrCreateWallet(customer_id);
  const before = Number(wallet.balance || 0);

  if (before < amount) {
    throw new Error(
      `Insufficient wallet balance. Available: ₦${before.toLocaleString()}, Required: ₦${amount.toLocaleString()}`
    );
  }

  const after = before - amount;
  await updateBalance(customer_id, after);

  const ref =
    reference ||
    `SALE-${sale_id ? sale_id.slice(-8) : Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 5)}`;

  // Wire sale_id directly into recordTransaction so it lands in the DB column
  await recordTransaction({
    wallet_id: wallet.id,
    customer_id,
    type: "SALE_PAYMENT",
    direction: "DEBIT",
    amount,
    balance_before: before,
    balance_after: after,
    payment_method: "WALLET",
    reference: ref,
    // Always set notes — never leave blank for traceability
    notes: notes || `Payment for sale #${sale_id}`,
    sale_id,                    // ← this is what was missing before
    performed_by: performed_by ?? null,
  });

  return after;
}

/* -------------------------------------------------------------------------- */
/*  refundToWallet                                                             */
/*                                                                            */
/*  Credits the wallet for a refund.  Also links sale_id for audit trail.    */
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
  await assertWalletActive(customer_id);

  const wallet = await getOrCreateWallet(customer_id);
  const before = Number(wallet.balance || 0);
  const after = before + amount;

  await updateBalance(customer_id, after);

  const ref =
    reference ||
    `REFUND-${sale_id ? sale_id.slice(-8) : Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 5)}`;

  await recordTransaction({
    wallet_id: wallet.id,
    customer_id,
    type: "REFUND",
    direction: "CREDIT",
    amount,
    balance_before: before,
    balance_after: after,
    payment_method: "WALLET",
    reference: ref,
    notes: notes || `Refund for sale #${sale_id}`,
    sale_id,
    performed_by: performed_by ?? null,
  });

  return after;
}

/* -------------------------------------------------------------------------- */
/*  transferWallet                                                             */
/*                                                                            */
/*  Moves funds between two customer wallets in two atomic steps.             */
/*  Note: this is NOT a DB transaction — if the deposit fails after the       */
/*  withdrawal the sender loses funds.  For production, wrap in a Supabase    */
/*  RPC / DB function to make it truly atomic.                                */
/* -------------------------------------------------------------------------- */

export async function transferWallet(
  senderId: string,
  receiverId: string,
  amount: number
) {
  const ref = `TRF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  // Debit the sender first
  await withdraw({
    customer_id: senderId,
    amount,
    payment_method: "WALLET",
    reference: `${ref}-OUT`,
    notes: `Wallet transfer to customer ${receiverId}`,
  });

  // Credit the receiver
  await deposit({
    customer_id: receiverId,
    amount,
    payment_method: "WALLET",
    reference: `${ref}-IN`,
    notes: `Wallet transfer from customer ${senderId}`,
  });
}

/* -------------------------------------------------------------------------- */
/*  adjustWallet                                                               */
/*                                                                            */
/*  Manual balance adjustment performed by staff (e.g. opening balance fix). */
/*  payment_method is "SYSTEM" because there is no real cash transaction —    */
/*  it is a bookkeeping entry, and "SYSTEM" is the only DB-valid value for    */
/*  this scenario.  "OTHER" was previously used but is rejected by the DB     */
/*  CHECK constraint.                                                         */
/* -------------------------------------------------------------------------- */

export async function adjustWallet(input: WalletAdjustmentInput) {
  const ref =
    input.reference ||
    `ADJ-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  if (input.direction === "CREDIT") {
    return deposit({
      customer_id: input.customer_id,
      amount: input.amount,
      payment_method: "SYSTEM",   // only valid non-cash method in DB CHECK
      reference: ref,
      notes: input.notes,
      performed_by: input.performed_by,
    });
  }

  return withdraw({
    customer_id: input.customer_id,
    amount: input.amount,
    payment_method: "SYSTEM",
    reference: ref,
    notes: input.notes,
    performed_by: input.performed_by,
  });
}

/* -------------------------------------------------------------------------- */
/*  Public aliases for backward-compat with customer-finance.service          */
/* -------------------------------------------------------------------------- */

export const depositToWallet = deposit;
export const withdrawFromWallet = withdraw;
