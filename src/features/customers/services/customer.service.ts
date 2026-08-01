import { supabase } from "../../../api/supabase";
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../types/customer";

type CustomerWithWallet = Customer & {
  customer_wallets?: {
    balance: number;
    status: "ACTIVE" | "SUSPENDED";
  } | null;
};

function mapCustomer(customer: CustomerWithWallet): Customer {
  return {
    ...customer,
    wallet_balance: Number(customer.customer_wallets?.balance ?? 0),
    status: customer.customer_wallets?.status ?? "ACTIVE",
  };
}

export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from("customers")
    .select(`
      *,
      customer_wallets (
        balance,
        status
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const mappedCustomers = (data as CustomerWithWallet[]).map(mapCustomer);

  // Compute real outstanding debt per customer from sales
  try {
    const { data: salesData } = await supabase
      .from("sales")
      .select("customer_id, payable_amount, amount_paid, status")
      .eq("status", "COMPLETED");

    interface MinimalSaleRecord {
      customer_id?: string;
      payable_amount?: number;
      amount_paid?: number;
      status?: string;
    }

    const debtMap: Record<string, number> = {};
    (salesData || []).forEach((s: MinimalSaleRecord) => {
      if (!s.customer_id) return;
      const payable = Number(s.payable_amount || 0);
      const paid = Number(s.amount_paid ?? payable);
      const debt = Math.max(0, payable - paid);
      if (debt > 0) {
        debtMap[s.customer_id] = (debtMap[s.customer_id] || 0) + debt;
      }
    });

    return mappedCustomers.map((c) => ({
      ...c,
      outstanding_debt: debtMap[c.id] ?? c.outstanding_debt ?? 0,
    }));
  } catch {
    return mappedCustomers;
  }
};

export const getCustomer = async (
  id: string
): Promise<Customer> => {
  const { data, error } = await supabase
    .from("customers")
    .select(`
      *,
      customer_wallets (
        balance,
        status
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  return mapCustomer(data as CustomerWithWallet);
};

export const getCustomerById = getCustomer;

export const createCustomer = async (
  input: CreateCustomerInput
): Promise<Customer> => {
  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: input.name.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      remarks: input.remarks?.trim() || null,
    })
    .select()
    .single();

  if (error) throw error;

  const customer = data as Customer;

  const walletBalance = input.wallet_balance ?? 0;

  const { error: walletError } = await supabase
    .from("customer_wallets")
    .insert({
      customer_id: customer.id,
      balance: walletBalance,
      status: "ACTIVE",
      currency: "NGN",
    });

  if (walletError) {
    console.warn("Wallet initialization failed:", walletError);
  }

  return {
    ...customer,
    wallet_balance: walletBalance,
    status: "ACTIVE",
  };
};

export const updateCustomer = async (
  id: string,
  input: UpdateCustomerInput
): Promise<Customer> => {
  const {error } = await supabase
    .from("customers")
    .update({
      name: input.name.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      remarks: input.remarks?.trim() || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return getCustomer(id);
};

export const deleteCustomer = async (
  id: string
): Promise<void> => {
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) throw error;
};