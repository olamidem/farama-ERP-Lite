import { supabase } from "../../../api/supabase";
import { deposit } from "./wallet.service";

/* -------------------------------------------------------------------------- */
/* Customer Credit Summary                                                    */
/* -------------------------------------------------------------------------- */

export async function getOutstandingDebt(
  customerId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("customers")
    .select("outstanding_debt")
    .eq("id", customerId)
    .single();

  if (error) throw error;

  return Number(data.outstanding_debt ?? 0);
}

/* -------------------------------------------------------------------------- */

export async function getCreditLimit(
  customerId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("customers")
    .select("credit_limit")
    .eq("id", customerId)
    .single();

  if (error) throw error;

  return Number(data.credit_limit ?? 0);
}

/* -------------------------------------------------------------------------- */

export async function getAvailableCredit(
  customerId: string
): Promise<number> {
  const [limit, debt] = await Promise.all([
    getCreditLimit(customerId),
    getOutstandingDebt(customerId),
  ]);

  return Math.max(0, limit - debt);
}

/* -------------------------------------------------------------------------- */
/* Validate Credit                                                            */
/* -------------------------------------------------------------------------- */

export async function validateCredit(
  customerId: string,
  amount: number
) {
  const available = await getAvailableCredit(customerId);

  if (available < amount) {
    throw new Error(
      `Customer exceeded credit limit.\nAvailable Credit: ₦${available.toLocaleString()}`
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Increase Outstanding Debt                                                  */
/* -------------------------------------------------------------------------- */

export async function addOutstandingDebt(
  customerId: string,
  amount: number
) {
  const debt = await getOutstandingDebt(customerId);

  await validateCredit(customerId, amount);

  const { error } = await supabase
    .from("customers")
    .update({
      outstanding_debt: debt + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  if (error) throw error;
}

/* -------------------------------------------------------------------------- */
/* Reduce Outstanding Debt                                                    */
/* -------------------------------------------------------------------------- */

export async function reduceOutstandingDebt(
  customerId: string,
  amount: number
) {
  const debt = await getOutstandingDebt(customerId);

  const remaining = Math.max(0, debt - amount);

  const { error } = await supabase
    .from("customers")
    .update({
      outstanding_debt: remaining,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  if (error) throw error;
}

/* -------------------------------------------------------------------------- */
/* Pay Customer Debt                                                          */
/* -------------------------------------------------------------------------- */

export async function payOutstandingDebt({
  customerId,
  amount,
  paymentMethod,
  performedBy,
}: {
  customerId: string;
  amount: number;
  paymentMethod: string;
  performedBy?: string;
}) {
  const debt = await getOutstandingDebt(customerId);

  if (debt <= 0) {
    throw new Error("Customer has no outstanding debt.");
  }

  const payment = Math.min(amount, debt);

  await reduceOutstandingDebt(customerId, payment);

  if (paymentMethod === "WALLET") {
    await deposit({
      customer_id: customerId,
      amount: payment,
      payment_method: "WALLET",
      notes: "Debt repayment",
      performed_by: performedBy,
    });
  }

  await supabase.from("customer_credit_transactions").insert({
    customer_id: customerId,
    amount: payment,
    transaction_type: "PAYMENT",
    payment_method: paymentMethod,
    performed_by: performedBy,
    created_at: new Date().toISOString(),
  });

  return payment;
}

/* -------------------------------------------------------------------------- */
/* Create Credit Transaction                                                  */
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
  await addOutstandingDebt(customerId, amount);

  const { error } = await supabase
    .from("customer_credit_transactions")
    .insert({
      customer_id: customerId,
      sale_id: saleId,
      amount,
      transaction_type: "SALE",
      performed_by: performedBy,
      created_at: new Date().toISOString(),
    });

  if (error) throw error;
}

/* -------------------------------------------------------------------------- */
/* Debt History                                                               */
/* -------------------------------------------------------------------------- */

export async function getCreditHistory(customerId: string) {
  const { data, error } = await supabase
    .from("customer_credit_transactions")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

/* -------------------------------------------------------------------------- */
/* Account Statement                                                          */
/* -------------------------------------------------------------------------- */

export async function getCustomerStatement(customerId: string) {
  const [customer, history] = await Promise.all([
    supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single(),

    getCreditHistory(customerId),
  ]);

  return {
    customer: customer.data,
    history,
  };
}