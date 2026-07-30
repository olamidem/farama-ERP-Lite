import { supabase } from "../../../api/supabase";
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../types/customer";

export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from("customers")
    .select(`
      *,
      customer_wallets ( status )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    const { data: fallbackData, error: fallbackErr } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (fallbackErr) throw fallbackErr;
    return ((fallbackData ?? []) as Customer[]).map((c: Customer) => ({ ...c, status: "ACTIVE" as const }));
  }

  type CustomerWithWallet = Customer & {
    customer_wallets?: { status?: "ACTIVE" | "SUSPENDED" } | { status?: "ACTIVE" | "SUSPENDED" }[];
  };

  return ((data ?? []) as unknown as CustomerWithWallet[]).map((item) => {
    const wallet = Array.isArray(item.customer_wallets)
      ? item.customer_wallets[0]
      : item.customer_wallets;
    return {
      ...item,
      status: (wallet?.status || "ACTIVE") as "ACTIVE" | "SUSPENDED",
    };
  });
};

export const getCustomer = async (
  id: string
): Promise<Customer> => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
};

export const getCustomerById = getCustomer;

export const createCustomer = async (
  input: CreateCustomerInput
): Promise<Customer> => {
  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      address: input.address || null,
      remarks: input.remarks || null,
      wallet_balance: input.wallet_balance || 0,
      outstanding_debt: input.outstanding_debt || 0,
    })
    .select()
    .single();

  if (error) throw error;

  const { error: walletError } = await supabase
    .from("customer_wallets")
    .insert({
      customer_id: data.id,
    });

  if (walletError) {
    console.warn("Wallet initialization warning:", walletError);
  }

  return data;
};

export const updateCustomer = async (
  id: string,
  input: UpdateCustomerInput
): Promise<Customer> => {
  const { data, error } = await supabase
    .from("customers")
    .update({
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      address: input.address || null,
      remarks: input.remarks || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
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
