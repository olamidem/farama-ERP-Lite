/**
 * customer-finance.service.ts
 *
 * High-level façade that orchestrates customer financial operations.
 * This file deliberately uses the sales-module PaymentMethod type for its
 * public API surface (matching the payment modal's type system), but maps to
 * WalletPaymentMethod internally before delegating to wallet.service.ts.
 *
 * Mapping table (sales PaymentMethod → WalletPaymentMethod):
 *   CASH          → CASH
 *   BANK_TRANSFER → BANK_TRANSFER
 *   TRANSFER      → BANK_TRANSFER   (alias)
 *   CARD / POS    → CARD
 *   WALLET        → WALLET
 *   DEPOSIT/SPLIT → CASH            (no direct wallet equivalent, use CASH)
 *   *             → CASH            (safe fallback
 */

import { supabase } from "../../../../api/supabase";
import type { PaymentMethod } from "../../types/payment";
import type { WalletPaymentMethod } from "../../../customers/types/wallet";
import {
  addCustomerDebt,
  reduceCustomerDebt,
} from "./customer-credit.service";
import {
  depositToWallet,
  withdrawFromWallet,
} from "./wallet.service";

/* -------------------------------------------------------------------------- */
/*  mapToWalletPaymentMethod                                                   */
/*                                                                            */
/*  The sales PaymentMethod union contains values like "POS", "TRANSFER",     */
/*  "DEPOSIT" etc. that the wallet_transactions table does not accept (its     */
/*  CHECK constraint only allows CASH | BANK_TRANSFER | CARD | WALLET |       */
/*  SYSTEM).  This mapper prevents INSERT failures by normalising the value.  */
/* -------------------------------------------------------------------------- */

function mapToWalletPaymentMethod(
  method: PaymentMethod | undefined
): WalletPaymentMethod {
  switch (method) {
    case "CASH":
      return "CASH";
    case "BANK_TRANSFER":
    case "TRANSFER":            // "TRANSFER" is a sales alias for bank transfer
      return "BANK_TRANSFER";
    case "CARD":
    case "POS":                 // POS terminal → CARD in wallet semantics
      return "CARD";
    case "WALLET":
      return "WALLET";
    default:
      // DEPOSIT, SPLIT, undefined or any future unknown method fall back to CASH
      // so we never violate the CHECK constraint
      return "CASH";
  }
}

/* -------------------------------------------------------------------------- */
/*  addOutstandingBalance  (alias: increaseOutstandingDebt)                   */
/*                                                                            */
/*  Called at checkout when amount_paid < payable_amount.  Writes a SALE row  */
/*  to customer_credit_transactions and validates credit limit.               */
/*                                                                            */
/*  NOTE: paymentMethod is intentionally unused here — it is captured in the  */
/*  wallet_transactions row (for WALLET-funded purchases) not the credit tx.  */
/* -------------------------------------------------------------------------- */

export async function addOutstandingBalance(
  customerId: string,
  saleId?: string,
  amount = 0,
  _paymentMethod?: PaymentMethod,  // prefixed with _ to silence unused-var lint
  performedBy?: string
) {
  if (amount <= 0) return;
  return addCustomerDebt(customerId, amount, saleId, performedBy);
}

export const increaseOutstandingDebt = addOutstandingBalance;

/* -------------------------------------------------------------------------- */
/*  payOutstandingBalance  (alias: reduceOutstandingDebt)                     */
/*                                                                            */
/*  Records a PAYMENT credit transaction.  Maps the incoming PaymentMethod to */
/*  a wallet-safe value before persisting.                                    */
/* -------------------------------------------------------------------------- */

export async function payOutstandingBalance(input: {
  customer_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference?: string;
  notes?: string;
  performed_by?: string;
  sale_id?: string;
}) {
  return reduceCustomerDebt(
    input.customer_id,
    input.amount,
    mapToWalletPaymentMethod(input.payment_method),
    input.performed_by,
    input.notes,
    input.sale_id
  );
}

export const reduceOutstandingDebt = payOutstandingBalance;

/* -------------------------------------------------------------------------- */
/*  depositWallet                                                              */
/*                                                                            */
/*  Deposits funds into a customer's wallet.  Converts PaymentMethod → wallet  */
/*  safe value so we never hit the CHECK constraint on payment_method.        */
/* -------------------------------------------------------------------------- */

export async function depositWallet(input: {
  customer_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference?: string;
  notes?: string;
  performed_by?: string;
}) {
  return depositToWallet({
    customer_id: input.customer_id,
    amount: input.amount,
    payment_method: mapToWalletPaymentMethod(input.payment_method),
    notes: input.notes || `Deposit via ${input.payment_method}`,
    reference:
      input.reference ||
      `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    performed_by: input.performed_by,
  });
}

/* -------------------------------------------------------------------------- */
/*  withdrawWallet                                                             */
/*                                                                            */
/*  Withdraws funds from a customer's wallet.                                 */
/* -------------------------------------------------------------------------- */

export async function withdrawWallet(input: {
  customer_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference?: string;
  notes?: string;
  performed_by?: string;
}) {
  return withdrawFromWallet({
    customer_id: input.customer_id,
    amount: input.amount,
    payment_method: mapToWalletPaymentMethod(input.payment_method),
    notes: input.notes || `Withdrawal via ${input.payment_method}`,
    reference:
      input.reference ||
      `WTH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    performed_by: input.performed_by,
  });
}

/* -------------------------------------------------------------------------- */
/*  payOutstandingUsingWallet                                                  */
/*                                                                            */
/*  Convenience: debit wallet AND mark the debt as reduced in a single call.  */
/*  Used when a customer pays off their outstanding balance from wallet funds. */
/* -------------------------------------------------------------------------- */

export async function payOutstandingUsingWallet(
  customerId: string,
  amount: number,
  performedBy?: string,
  saleId?: string
) {
  const ref = `DEBT-REPAY-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 6)}`;

  // Step 1: debit the wallet
  await withdrawWallet({
    customer_id: customerId,
    amount,
    payment_method: "WALLET",
    reference: ref,
    notes: "Outstanding debt repayment via wallet",
    performed_by: performedBy,
  });

  // Step 2: record the debt reduction in customer_credit_transactions
  await payOutstandingBalance({
    customer_id: customerId,
    amount,
    payment_method: "WALLET",
    reference: ref,
    notes: "Outstanding debt repayment via wallet",
    performed_by: performedBy,
    sale_id: saleId,
  });
}

/* -------------------------------------------------------------------------- */
/*  refundToWallet                                                             */
/*                                                                            */
/*  Issues a refund back to the customer's wallet.                            */
/* -------------------------------------------------------------------------- */

export async function refundToWallet(input: {
  customer_id: string;
  amount: number;
  payment_method?: PaymentMethod;
  reference?: string;
  notes?: string;
  performed_by?: string;
}) {
  return depositWallet({
    customer_id: input.customer_id,
    amount: input.amount,
    // Refunds always come from the system, not a cash payment
    payment_method: "WALLET",
    reference: input.reference,
    notes: input.notes || "Refund to wallet",
    performed_by: input.performed_by,
  });
}

/* -------------------------------------------------------------------------- */
/*  getCustomerFinanceSummary                                                  */
/*                                                                            */
/*  Returns wallet balance + computed outstanding debt in one call.            */
/*  Outstanding debt is always computed live from the sales table (not from   */
/*  a denormalised column) so it is always accurate.                          */
/* -------------------------------------------------------------------------- */

export async function getCustomerFinanceSummary(customerId: string) {
  const walletResult = await supabase
    .from("customer_wallets")
    .select("balance,status")
    .eq("customer_id", customerId)
    .maybeSingle();

  const outstandingDebt = await getCustomerDebt(customerId);

  return {
    wallet_balance: Number(walletResult.data?.balance ?? 0),
    wallet_status: walletResult.data?.status ?? "ACTIVE",
    outstanding_debt: outstandingDebt,
  };
}

/* -------------------------------------------------------------------------- */
/*  getCustomerDebt                                                            */
/*                                                                            */
/*  Computes the customer's actual outstanding balance from the sales table   */
/*  (payable_amount - amount_paid).  This is the ground truth; do not cache   */
/*  or denormalise this value on the customers table.                         */
/* -------------------------------------------------------------------------- */

async function getCustomerDebt(customerId: string): Promise<number> {
  try {
    const { data } = await supabase
      .from("sales")
      .select("payable_amount, amount_paid")
      .eq("customer_id", customerId)
      .eq("status", "COMPLETED");

    if (!data) return 0;

    return data.reduce((sum, sale) => {
      const payable = Number(sale.payable_amount || 0);
      const paid = Number(sale.amount_paid ?? payable);
      return sum + Math.max(0, payable - paid);
    }, 0);
  } catch {
    return 0;
  }
}
