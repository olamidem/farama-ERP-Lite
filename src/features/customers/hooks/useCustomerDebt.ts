import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "../../../api/supabase";
import { QUERY_KEYS } from "../../../lib/queryKey";
import type { PaymentMethod } from "../../sales/types/payment";
import type { Sale } from "../../sales/types/sale";

export interface CustomerDebtDetails {
  outstanding_debt: number;
  credit_limit: number;
  available_credit: number;
  unpaid_sales: Sale[];
}

export function useCustomerDebt(customerId: string | null) {
  return useQuery({
    queryKey: ["customer_debt", customerId],
    queryFn: async (): Promise<CustomerDebtDetails> => {
      if (!customerId) {
        return {
          outstanding_debt: 0,
          credit_limit: 500000,
          available_credit: 500000,
          unpaid_sales: [],
        };
      }

      try {
        const { data: salesData, error } = await supabase
          .from("sales")
          .select(`
            *,
            items:sale_items(
              *,
              product:products(*)
            )
          `)
          .eq("customer_id", customerId)
          .eq("status", "COMPLETED")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const sales = (salesData || []) as Sale[];
        const unpaid_sales = sales.filter((s) => {
          const payable = Number(s.payable_amount || s.total_amount || 0);
          const paid = Number(s.amount_paid ?? payable);
          return payable - paid > 0.01;
        });

        const outstanding_debt = sales.reduce((sum, s) => {
          const payable = Number(s.payable_amount || s.total_amount || 0);
          const paid = Number(s.amount_paid ?? payable);
          return sum + Math.max(0, payable - paid);
        }, 0);

        const credit_limit = 500000;
        const available_credit = Math.max(0, credit_limit - outstanding_debt);

        return {
          outstanding_debt,
          credit_limit,
          available_credit,
          unpaid_sales,
        };
      } catch {
        // Fallback to local storage if offline
        const stored = localStorage.getItem("farama_pos_sales");
        let sales: Sale[] = [];
        if (stored) {
          const parsed = JSON.parse(stored) as Sale[];
          sales = parsed.filter(
            (s) => s.customer_id === customerId && s.status === "COMPLETED"
          );
        }

        const unpaid_sales = sales.filter((s) => {
          const payable = Number(s.payable_amount || s.total_amount || 0);
          const paid = Number(s.amount_paid ?? payable);
          return payable - paid > 0.01;
        });

        const outstanding_debt = sales.reduce((sum, s) => {
          const payable = Number(s.payable_amount || s.total_amount || 0);
          const paid = Number(s.amount_paid ?? payable);
          return sum + Math.max(0, payable - paid);
        }, 0);

        const credit_limit = 500000;
        return {
          outstanding_debt,
          credit_limit,
          available_credit: Math.max(0, credit_limit - outstanding_debt),
          unpaid_sales,
        };
      }
    },
    enabled: !!customerId,
  });
}

export interface SettleDebtInput {
  customerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  saleId?: string; // Optional: target specific unpaid sale
}

export function useSettleCustomerDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      amount,
      paymentMethod,
      notes,
      saleId,
    }: SettleDebtInput) => {
      if (amount <= 0) throw new Error("Repayment amount must be greater than zero.");

      // If paying with wallet, check wallet balance
      if (paymentMethod === "WALLET") {
        const { payOutstandingUsingWallet } = await import(
          "../../sales/services/customers/customer-finance.service"
        );
        await payOutstandingUsingWallet(customerId, amount);
      } else {
        const { payOutstandingBalance } = await import(
          "../../sales/services/customers/customer-finance.service"
        );
        await payOutstandingBalance({
          customer_id: customerId,
          amount,
          payment_method: paymentMethod,
          notes: notes || "Customer debt settlement",
        });
      }

      // If specific saleId target was given, update that sale's amount_paid directly as well
      if (saleId) {
        try {
          const { updateSalePayment } = await import(
            "../../sales/services/sales/sales.service"
          );
          await updateSalePayment(saleId, amount, paymentMethod, notes);
        } catch (e) {
          console.warn("Sale payment update notice:", e);
        }
      }

      return { customerId, amount };
    },
    onSuccess: async (_, variables) => {
      toast.success(`Debt repayment of ₦${variables.amount.toLocaleString()} recorded!`);

      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customers.all,
      });
      await queryClient.invalidateQueries({
        queryKey: ["customer_debt", variables.customerId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["customer_sales", variables.customerId],
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wallets.detail(variables.customerId),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wallets.transactions(variables.customerId),
      });
      await queryClient.invalidateQueries({
        queryKey: ["sales"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to settle customer debt.");
    },
  });
}
