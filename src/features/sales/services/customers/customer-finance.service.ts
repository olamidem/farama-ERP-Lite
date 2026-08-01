import { supabase } from "../../../../api/supabase";
import type { PaymentMethod } from "../../types/payment";
import {
  addCustomerDebt,
  reduceCustomerDebt,
} from "./customer-credit.service";
import {
  depositToWallet,
  withdrawFromWallet,
} from "./wallet.service";

/* -------------------------------------------------------------------------- */
/* Add Outstanding Credit                                                     */
/* -------------------------------------------------------------------------- */

export async function addOutstandingBalance(
  customerId: string,
  saleId?: string,
  amount = 0,
  paymentMethod?: PaymentMethod,
  performedBy?: string,
) {
  if (saleId && paymentMethod && performedBy) {
    // optional metadata tracking
  }
  return addCustomerDebt(customerId, amount);
}

export const increaseOutstandingDebt = addOutstandingBalance;

/* -------------------------------------------------------------------------- */
/* Customer Pays Outstanding Credit                                           */
/* -------------------------------------------------------------------------- */

export async function payOutstandingBalance(input: {
  customer_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference?: string;
  notes?: string;
  performed_by?: string;
}) {
  return reduceCustomerDebt(input.customer_id, input.amount);
}

export const reduceOutstandingDebt = payOutstandingBalance;

/* -------------------------------------------------------------------------- */
/* Deposit Money Into Wallet                                                  */
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
    payment_method: input.payment_method || "CASH",
    notes: input.notes,
    reference:
      input.reference ||
      `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    performed_by: input.performed_by,
  });
}

/* -------------------------------------------------------------------------- */
/* Withdraw From Wallet                                                       */
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
    payment_method: input.payment_method || "WALLET",
    notes: input.notes,
    reference:
      input.reference ||
      `WTH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    performed_by: input.performed_by,
  });
}

/* -------------------------------------------------------------------------- */
/* Wallet → Outstanding Debt                                                  */
/* -------------------------------------------------------------------------- */

export async function payOutstandingUsingWallet(
  customerId: string,
  amount: number,
  performedBy?: string,
) {
  const ref = `DEBT-REPAY-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  await withdrawWallet({
    customer_id: customerId,
    amount,
    payment_method: "WALLET",
    reference: ref,
    notes: "Outstanding debt repayment via wallet",
    performed_by: performedBy,
  });

  await payOutstandingBalance({
    customer_id: customerId,
    amount,
    payment_method: "WALLET",
    reference: ref,
    notes: "Outstanding debt repayment via wallet",
    performed_by: performedBy,
  });
}

/* -------------------------------------------------------------------------- */
/* Refund Back To Wallet                                                      */
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
    payment_method: "WALLET",
    reference: input.reference,
    notes: input.notes,
    performed_by: input.performed_by,
  });
}

/* -------------------------------------------------------------------------- */
/* Customer Finance Summary                                                   */
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
