import { supabase } from "../../../api/supabase";
import type { Customer } from "../../customers/types/customer";

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
  const customer = await getCustomer(customerId);

  if (!customer) return 0;

  return Number(customer.outstanding_debt ?? 0);
}

/* -------------------------------------------------------------------------- */
/* Increase Outstanding Debt                                                  */
/* -------------------------------------------------------------------------- */

export async function increaseOutstandingDebt(
  customerId: string,
  amount: number
): Promise<void> {
  const debt = await getOutstandingDebt(customerId);

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
): Promise<void> {
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
/* Clear Outstanding Debt                                                     */
/* -------------------------------------------------------------------------- */

export async function clearOutstandingDebt(
  customerId: string
): Promise<void> {
  const { error } = await supabase
    .from("customers")
    .update({
      outstanding_debt: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  if (error) throw error;
}

/* -------------------------------------------------------------------------- */
/* Set Outstanding Debt                                                       */
/* -------------------------------------------------------------------------- */

export async function setOutstandingDebt(
  customerId: string,
  amount: number
): Promise<void> {
  const { error } = await supabase
    .from("customers")
    .update({
      outstanding_debt: amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  if (error) throw error;
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

  return {
    walletBalance: Number(customer.wallet_balance ?? 0),
    outstandingDebt: Number(customer.outstanding_debt ?? 0),
    availableCredit:
      Number(customer.credit_limit ?? 0) -
      Number(customer.outstanding_debt ?? 0),
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