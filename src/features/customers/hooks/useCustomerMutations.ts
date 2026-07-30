import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "../../../api/supabase";

import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customer.service";
import { depositToWallet } from "../services/wallet.service";

import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../types/customer";

import { QUERY_KEYS } from "../../../lib/queryKey";
import { getReadableError } from "../../../utils/error";

const invalidateCustomers = async (
  queryClient: ReturnType<typeof useQueryClient>,
  customerId?: string
) => {
  await queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.customers.all,
  });

  if (customerId) {
    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.customers.detail(customerId),
    });

    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.customers.ledger(customerId),
    });

    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.wallets.detail(customerId),
    });

    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.wallets.transactions(customerId),
    });
  }

  await queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.wallets.all,
  });

  await queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.wallets.overview,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCustomerInput) => createCustomer(input),

    onSuccess: async () => {
      await invalidateCustomers(queryClient);
      toast.success("Customer created successfully.");
    },

    onError: (error) => {
      toast.error(getReadableError(error));
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateCustomerInput;
    }) => updateCustomer(id, input),

    onSuccess: async (_, variables) => {
      await invalidateCustomers(queryClient, variables.id);
      toast.success("Customer updated successfully.");
    },

    onError: (error) => {
      toast.error(getReadableError(error));
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),

    onSuccess: async (_, id) => {
      await invalidateCustomers(queryClient, id);
      toast.success("Customer deleted successfully.");
    },

    onError: (error) => {
      toast.error(getReadableError(error));
    },
  });
};

export const useAddCustomerLedgerEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      type,
      amount,
      remarks,
    }: {
      customerId: string;
      type: "TOP_UP" | "PAYMENT" | "DEBIT";
      amount: number;
      remarks?: string;
    }) => {
      if (type === "TOP_UP") {
        return depositToWallet({
          customer_id: customerId,
          amount,
          payment_method: "CASH",
          notes: remarks || "Manual Top Up / Deposit",
        });
      } else if (type === "PAYMENT") {
        const { data: cust } = await supabase
          .from("customers")
          .select("outstanding_debt")
          .eq("id", customerId)
          .single();
        const currentDebt = cust?.outstanding_debt || 0;
        const newDebt = Math.max(0, currentDebt - amount);
        const { error } = await supabase
          .from("customers")
          .update({
            outstanding_debt: newDebt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", customerId);
        if (error) throw error;
        return { customerId, type, amount, remarks };
      } else if (type === "DEBIT") {
        const { data: cust } = await supabase
          .from("customers")
          .select("outstanding_debt")
          .eq("id", customerId)
          .single();
        const currentDebt = cust?.outstanding_debt || 0;
        const newDebt = currentDebt + amount;
        const { error } = await supabase
          .from("customers")
          .update({
            outstanding_debt: newDebt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", customerId);
        if (error) throw error;
        return { customerId, type, amount, remarks };
      }
      return { customerId, type, amount, remarks };
    },

    onSuccess: async (_, variables) => {
      await invalidateCustomers(queryClient, variables.customerId);
      toast.success("Ledger entry updated successfully.");
    },

    onError: (error) => {
      toast.error(getReadableError(error));
    },
  });
};
