import { supabase } from "../../../api/supabase";

import type { PaymentMethod } from "../../sales/types/payment";

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
  saleId: string,
  amount: number,
  paymentMethod?: PaymentMethod,
  performedBy?: string,
) {
  return addCustomerDebt({
    customer_id: customerId,
    sale_id: saleId,
    amount,
    payment_method: paymentMethod,
    performed_by: performedBy,
  });
}

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
  return reduceCustomerDebt(input);
}

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
  return depositToWallet(input);
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
  return withdrawFromWallet(input);
}

/* -------------------------------------------------------------------------- */
/* Wallet → Outstanding Debt                                                  */
/* -------------------------------------------------------------------------- */

export async function payOutstandingUsingWallet(
  customerId: string,
  amount: number,
  performedBy?: string,
) {
  await withdrawWallet({
    customer_id: customerId,
    amount,
    payment_method: "WALLET",
    notes: "Outstanding payment via wallet",
    performed_by: performedBy,
  });

  await payOutstandingBalance({
    customer_id: customerId,
    amount,
    payment_method: "WALLET",
    notes: "Outstanding payment via wallet",
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
  const [customerResult, walletResult] = await Promise.all([
    supabase
      .from("customers")
      .select("wallet_balance,outstanding_debt")
      .eq("id", customerId)
      .single(),

    supabase
      .from("customer_wallets")
      .select("balance,status")
      .eq("customer_id", customerId)
      .maybeSingle(),
  ]);

  return {
    wallet_balance:
      Number(walletResult.data?.balance ?? customerResult.data?.wallet_balance ?? 0),

    wallet_status:
      walletResult.data?.status ?? "ACTIVE",

    outstanding_debt:
      Number(customerResult.data?.outstanding_debt ?? 0),
  };
}