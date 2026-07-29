import { supabase } from "../../../api/supabase";
import type { CreateCustomerInput, Customer, UpdateCustomerInput } from "../types";

const TABLE = "customers";

export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      customer_wallets (
        id,
        balance,
        currency,
        status
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
};

export const getCustomerById = async (
  id: string
): Promise<Customer> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      customer_wallets (
        id,
        balance,
        currency,
        status
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
};

export const createCustomer = async (
  payload: CreateCustomerInput
): Promise<Customer> => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      remarks: payload.remarks,
    })
    .select()
    .single();

  if (error) throw error;

  // Automatically create wallet
  const { error: walletError } = await supabase
    .from("customer_wallets")
    .insert({
      customer_id: data.id,
    });

  if (walletError) throw walletError;

  return data;
};

export const updateCustomer = async (
  id: string,
  payload: UpdateCustomerInput
): Promise<Customer> => {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      remarks: payload.remarks,
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
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const searchCustomers = async (
  search: string
): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      customer_wallets (
        id,
        balance,
        currency,
        status
      )
    `)
    .or(
      `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data ?? [];
};

export const getCustomerWallet = async (
  customerId: string
) => {
  const { data, error } = await supabase
    .from("customer_wallets")
    .select("*")
    .eq("customer_id", customerId)
    .single();

  if (error) throw error;

  return data;
};