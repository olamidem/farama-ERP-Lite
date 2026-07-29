import { supabase } from "../../../api/supabase";
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../types/customer";

export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
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
    })
    .select()
    .single();

  if (error) throw error;

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