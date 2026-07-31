import { supabase } from "../../../../api/supabase";
import type { Customer } from "../../../customers/types/customer";

/* -------------------------------------------------------------------------- */
/* Get Customer                                                               */
/* -------------------------------------------------------------------------- */

export async function getCustomer(
  customerId: string
): Promise<Customer | null> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

/* -------------------------------------------------------------------------- */
/* Get Customer Balance                                                       */
/* -------------------------------------------------------------------------- */

export async function getCustomerBalance(
  customerId: string
): Promise<number> {
  const customer = await getCustomer(customerId);

  if (!customer) return 0;

  return Number(customer.wallet_balance ?? 0);
}

/* -------------------------------------------------------------------------- */
/* Get Outstanding Debt                                                       */
/* -------------------------------------------------------------------------- */

export async function getOutstandingDebt(
  customerId: string
): Promise<number> {
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

/* -------------------------------------------------------------------------- */
/* Increase Outstanding Debt                                                  */
/* -------------------------------------------------------------------------- */

export async function increaseOutstandingDebt(
  customerId: string,
  amount: number
): Promise<void> {
  if (amount <= 0) return;
  try {
    await supabase
      .from("customers")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId);
  } catch (err) {
    console.warn("Could not update customer updated_at:", err);
  }
}

/* -------------------------------------------------------------------------- */
/* Reduce Outstanding Debt                                                    */
/* -------------------------------------------------------------------------- */

export async function reduceOutstandingDebt(
  customerId: string,
  amount: number
): Promise<void> {
  if (amount <= 0) return;
  try {
    await supabase
      .from("customers")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId);
  } catch (err) {
    console.warn("Could not update customer updated_at:", err);
  }
}

/* -------------------------------------------------------------------------- */
/* Clear Outstanding Debt                                                     */
/* -------------------------------------------------------------------------- */

export async function clearOutstandingDebt(
  customerId: string
): Promise<void> {
  try {
    await supabase
      .from("customers")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId);
  } catch (err) {
    console.warn("Could not update customer updated_at:", err);
  }
}

/* -------------------------------------------------------------------------- */
/* Set Outstanding Debt                                                       */
/* -------------------------------------------------------------------------- */

export async function setOutstandingDebt(
  customerId: string,
  amount: number
): Promise<void> {
  if (amount < 0) return;
  try {
    await supabase
      .from("customers")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId);
  } catch (err) {
    console.warn("Could not update customer updated_at:", err);
  }
}

/* -------------------------------------------------------------------------- */
/* Customer Financial Summary                                                 */
/* -------------------------------------------------------------------------- */

export async function getCustomerFinanceSummary(
  customerId: string
) {
  const customer = await getCustomer(customerId);

  if (!customer) {
    throw new Error("Customer not found");
  }

  const outstandingDebt = await getOutstandingDebt(customerId);

  return {
    walletBalance: Number(customer.wallet_balance ?? 0),
    outstandingDebt,
    availableCredit: 500000 - outstandingDebt,
  };
}

/* -------------------------------------------------------------------------- */
/* Check Credit Eligibility                                                   */
/* -------------------------------------------------------------------------- */

export async function canUseCredit(
  customerId: string,
  amount: number
): Promise<boolean> {
  const customer = await getCustomer(customerId);

  if (!customer) return false;

  const limit = Number(customer.credit_limit ?? 0);
  const debt = Number(customer.outstanding_debt ?? 0);

  return debt + amount <= limit;
}