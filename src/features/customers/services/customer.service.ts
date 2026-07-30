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
      customer_wallets ( balance, status )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    const { data: fallbackData, error: fallbackErr } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (fallbackErr) throw fallbackErr;
    return ((fallbackData ?? []) as Customer[]).map((c: Customer) => ({
      ...c,
      wallet_balance: Number(c.wallet_balance || 0),
      status: "ACTIVE" as const,
    }));
  }

  type CustomerWithWallet = Customer & {
    customer_wallets?:
      | { balance?: number; status?: "ACTIVE" | "SUSPENDED" }
      | { balance?: number; status?: "ACTIVE" | "SUSPENDED" }[];
  };

  return ((data ?? []) as unknown as CustomerWithWallet[]).map((item) => {
    const wallet = Array.isArray(item.customer_wallets)
      ? item.customer_wallets[0]
      : item.customer_wallets;
    const walletBal =
      wallet?.balance !== undefined && wallet?.balance !== null
        ? Number(wallet.balance)
        : Number(item.wallet_balance || 0);

    return {
      ...item,
      wallet_balance: walletBal,
      status: (wallet?.status || "ACTIVE") as "ACTIVE" | "SUSPENDED",
    };
  });
};

export const getCustomer = async (id: string): Promise<Customer> => {
  const { data, error } = await supabase
    .from("customers")
    .select(`
      *,
      customer_wallets ( balance, status )
    `)
    .eq("id", id)
    .single();

  if (error) {
    const { data: fallback, error: err2 } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (err2) throw err2;
    return {
      ...fallback,
      wallet_balance: Number(fallback.wallet_balance || 0),
      status: "ACTIVE",
    };
  }

  type CustomerWithWallet = Customer & {
    customer_wallets?:
      | { balance?: number; status?: "ACTIVE" | "SUSPENDED" }
      | { balance?: number; status?: "ACTIVE" | "SUSPENDED" }[];
  };

  const item = data as unknown as CustomerWithWallet;
  const wallet = Array.isArray(item.customer_wallets)
    ? item.customer_wallets[0]
    : item.customer_wallets;
  const walletBal =
    wallet?.balance !== undefined && wallet?.balance !== null
      ? Number(wallet.balance)
      : Number(item.wallet_balance || 0);

  return {
    ...item,
    wallet_balance: walletBal,
    status: (wallet?.status || "ACTIVE") as "ACTIVE" | "SUSPENDED",
  };
};

export const getCustomerById = getCustomer;

export const createCustomer = async (
  input: CreateCustomerInput
): Promise<Customer> => {
  const emailVal =
    input.email && input.email.trim() !== "" ? input.email.trim() : null;
  const phoneVal =
    input.phone && input.phone.trim() !== "" ? input.phone.trim() : null;
  const addressVal =
    input.address && input.address.trim() !== "" ? input.address.trim() : null;
  const remarksVal =
    input.remarks && input.remarks.trim() !== "" ? input.remarks.trim() : null;

  const payload: Record<string, unknown> = {
    name: input.name.trim(),
    email: emailVal,
    phone: phoneVal,
    address: addressVal,
    remarks: remarksVal,
  };

  const { data: insertedData, error } = await supabase
    .from("customers")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to create customer");
  }

  const customerRecord = insertedData as Customer;

  const initBalance = input.wallet_balance || 0;
  const initDebt = input.outstanding_debt || 0;

  // Try updating wallet_balance / outstanding_debt on customer table if those columns exist
  if (initBalance > 0 || initDebt > 0) {
    await supabase
      .from("customers")
      .update({
        wallet_balance: initBalance,
        outstanding_debt: initDebt,
      })
      .eq("id", customerRecord.id);
  }

  // Always initialize or update customer_wallets table entry
  if (customerRecord?.id) {
    const { error: walletError } = await supabase
      .from("customer_wallets")
      .insert({
        customer_id: customerRecord.id,
        balance: initBalance,
        status: "ACTIVE",
      });

    if (walletError) {
      console.warn("Wallet initialization warning:", walletError);
    }
  }

  return {
    ...customerRecord,
    wallet_balance: initBalance,
    outstanding_debt: initDebt,
    status: "ACTIVE",
  };
};

export const updateCustomer = async (
  id: string,
  input: UpdateCustomerInput
): Promise<Customer> => {
  const emailVal =
    input.email && input.email.trim() !== "" ? input.email.trim() : null;
  const phoneVal =
    input.phone && input.phone.trim() !== "" ? input.phone.trim() : null;
  const addressVal =
    input.address && input.address.trim() !== "" ? input.address.trim() : null;
  const remarksVal =
    input.remarks && input.remarks.trim() !== "" ? input.remarks.trim() : null;

  const { data, error } = await supabase
    .from("customers")
    .update({
      name: input.name.trim(),
      email: emailVal,
      phone: phoneVal,
      address: addressVal,
      remarks: remarksVal,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to update customer");
  }

  return data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    throw new Error(error.message || "Failed to delete customer");
  }
};
