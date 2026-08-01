/**
 * customer-credit.service.ts
 *
 * Authoritative service managing customer credit and debt ledger.
 *
 * Design Architecture:
 * 1. sales table:
 *    Holds the initial sale header, including payable_amount and initial amount_paid at checkout.
 *    The sales table amount_paid column is NOT updated when subsequent/continuous debt payments are made.
 *
 * 2. sale_payments table:
 *    Immutable log table holding EVERY payment record for a sale:
 *    - Initial payment made at checkout
 *    - Continuous / subsequent installment payments & debt settlements
 *
 * 3. customer_credit_transactions table:
 *    Customer-level financial ledger:
 *    - 'SALE': unpaid credit balance added at checkout time
 *    - 'PAYMENT': repayment made via CASH, POS, BANK_TRANSFER, or WALLET
 */

import { supabase } from "../../../../api/supabase";
import { deposit } from "./wallet.service";

/* -------------------------------------------------------------------------- */
/*  getOutstandingDebt                                                         */
/*                                                                            */
/*  Computes live outstanding customer debt from customer_credit_transactions:  */
/*  SUM(SALE debt) - SUM(PAYMENT debt repayments).                            */
/* -------------------------------------------------------------------------- */

export async function getOutstandingDebt(
  customerId: string
): Promise<number> {
  try {
    const { data: creditTxs, error } = await supabase
      .from("customer_credit_transactions")
      .select("amount, transaction_type")
      .eq("customer_id", customerId);

    if (error || !creditTxs || creditTxs.length === 0) {
      // Fallback: calculate from sales table if no credit transactions exist yet
      const { data: sales } = await supabase
        .from("sales")
        .select("payable_amount, amount_paid")
        .eq("customer_id", customerId)
        .eq("status", "COMPLETED");

      if (!sales) return 0;
      return sales.reduce((sum, sale) => {
        const payable = Number(sale.payable_amount || 0);
        const paid = Number(sale.amount_paid ?? payable);
        return sum + Math.max(0, payable - paid);
      }, 0);
    }

    const totalSalesDebt = creditTxs
      .filter((t) => t.transaction_type === "SALE")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalPayments = creditTxs
      .filter((t) => t.transaction_type === "PAYMENT")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    return Math.max(0, totalSalesDebt - totalPayments);
  } catch {
    return 0;
  }
}

/* -------------------------------------------------------------------------- */
/*  getCreditLimit                                                             */
/* -------------------------------------------------------------------------- */

export async function getCreditLimit(customerId?: string): Promise<number> {
  void customerId;
  return 500_000;
}

/* -------------------------------------------------------------------------- */

export async function getAvailableCredit(customerId: string): Promise<number> {
  const [limit, debt] = await Promise.all([
    getCreditLimit(customerId),
    getOutstandingDebt(customerId),
  ]);
  return Math.max(0, limit - debt);
}

/* -------------------------------------------------------------------------- */

export async function validateCredit(customerId: string, amount: number) {
  const available = await getAvailableCredit(customerId);
  if (available < amount) {
    throw new Error(
      `Customer exceeded credit limit.\nAvailable Credit: ₦${available.toLocaleString()}`
    );
  }
}

/* -------------------------------------------------------------------------- */
/*  addOutstandingDebt                                                         */
/*                                                                            */
/*  Records a new credit debt incurred during a POS checkout (transaction_type = 'SALE'). */
/* -------------------------------------------------------------------------- */

export async function addOutstandingDebt(
  customerId: string,
  amount: number,
  saleId?: string,
  performedBy?: string
) {
  if (amount <= 0) return;

  await validateCredit(customerId, amount);

  const { error } = await supabase
    .from("customer_credit_transactions")
    .insert({
      customer_id: customerId,
      sale_id: saleId ?? null,
      amount,
      transaction_type: "SALE",
      performed_by: performedBy ?? null,
      notes: saleId ? `Credit sale balance added for sale #${saleId}` : "Credit sale debt incurred",
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.warn("Failed to record credit transaction (SALE):", error.message, error);
  }
}

/* -------------------------------------------------------------------------- */
/*  reduceOutstandingDebt                                                      */
/*                                                                            */
/*  Records a continuous/installment debt repayment (transaction_type = 'PAYMENT') */
/*  in customer_credit_transactions AND inserts a new log entry in sale_payments. */
/*  Does NOT update sales.amount_paid on the sales table!                      */
/* -------------------------------------------------------------------------- */

export async function reduceOutstandingDebt(
  customerId: string,
  amount: number,
  paymentMethod?: string,
  performedBy?: string,
  notes?: string,
  saleId?: string
) {
  if (amount <= 0) return;

  // 1. Insert into customer_credit_transactions (customer ledger)
  const { error: creditErr } = await supabase
    .from("customer_credit_transactions")
    .insert({
      customer_id: customerId,
      sale_id: saleId ?? null,
      amount,
      transaction_type: "PAYMENT",
      payment_method: paymentMethod ?? "CASH",
      performed_by: performedBy ?? null,
      notes: notes || `Debt repayment of ₦${amount.toLocaleString()} via ${paymentMethod || "CASH"}`,
      created_at: new Date().toISOString(),
    });

  if (creditErr) {
    console.warn("Failed to record credit transaction (PAYMENT):", creditErr.message, creditErr);
  }

  // 2. If a specific saleId is linked, log into sale_payments table as well
  let targetSaleId = saleId;
  if (!targetSaleId) {
    // Find customer's oldest sale with an open balance to attach the payment log
    const { data: openSales } = await supabase
      .from("sales")
      .select("id")
      .eq("customer_id", customerId)
      .eq("status", "COMPLETED")
      .order("created_at", { ascending: true })
      .limit(1);

    if (openSales && openSales.length > 0) {
      targetSaleId = openSales[0].id;
    }
  }

  if (targetSaleId) {
    const { error: salePayErr } = await supabase
      .from("sale_payments")
      .insert({
        sale_id: targetSaleId,
        customer_id: customerId,
        amount,
        payment_method: paymentMethod || "CASH",
        reference: `REPAY-${Date.now()}`,
        notes: notes || `Continuous debt repayment via ${paymentMethod || "CASH"}`,
        performed_by: performedBy ?? null,
        created_at: new Date().toISOString(),
      });

    if (salePayErr) {
      console.warn("Failed to log sale_payments record during repayment:", salePayErr.message);
    }
  }
}

/* -------------------------------------------------------------------------- */
/*  payOutstandingDebt                                                         */
/* -------------------------------------------------------------------------- */

export async function payOutstandingDebt({
  customerId,
  amount,
  paymentMethod,
  performedBy,
  notes,
  saleId,
}: {
  customerId: string;
  amount: number;
  paymentMethod: string;
  performedBy?: string;
  notes?: string;
  saleId?: string;
}) {
  const debt = await getOutstandingDebt(customerId);

  if (debt <= 0) {
    throw new Error("Customer has no outstanding debt.");
  }

  const payment = Math.min(amount, debt);

  // Record PAYMENT row in customer_credit_transactions + sale_payments log
  await reduceOutstandingDebt(customerId, payment, paymentMethod, performedBy, notes, saleId);

  if (paymentMethod === "WALLET") {
    await deposit({
      customer_id: customerId,
      amount: payment,
      payment_method: "WALLET",
      notes: notes || "Debt repayment via customer wallet",
      performed_by: performedBy,
    });
  }

  return payment;
}

/* -------------------------------------------------------------------------- */
/*  createCreditTransaction                                                    */
/* -------------------------------------------------------------------------- */

export async function createCreditTransaction({
  customerId,
  saleId,
  amount,
  performedBy,
}: {
  customerId: string;
  saleId: string;
  amount: number;
  performedBy?: string;
}) {
  await addOutstandingDebt(customerId, amount, saleId, performedBy);
}

/* -------------------------------------------------------------------------- */
/*  getCreditHistory                                                           */
/* -------------------------------------------------------------------------- */

export async function getCreditHistory(customerId: string) {
  const { data, error } = await supabase
    .from("customer_credit_transactions")
    .select(`
      *,
      sale:sales(sale_number, total_amount, payable_amount, amount_paid),
      performer:profiles(full_name, email)
    `)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    const { data: fallback, error: err2 } = await supabase
      .from("customer_credit_transactions")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (err2) throw err2;
    return fallback;
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/*  getCustomerStatement                                                       */
/* -------------------------------------------------------------------------- */

export async function getCustomerStatement(customerId: string) {
  const [customer, history] = await Promise.all([
    supabase.from("customers").select("*").eq("id", customerId).single(),
    getCreditHistory(customerId),
  ]);

  return {
    customer: customer.data,
    history,
  };
}

/* -------------------------------------------------------------------------- */
/*  Aliases                                                                    */
/* -------------------------------------------------------------------------- */

export const addCustomerDebt = addOutstandingDebt;
export const increaseOutstandingDebt = addOutstandingDebt;
export const reduceCustomerDebt = reduceOutstandingDebt;
