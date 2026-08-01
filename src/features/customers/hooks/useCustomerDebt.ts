/**
 * useCustomerDebt.ts
 *
 * React Query hooks for fetching customer debt summary, debt history
 * (from customer_credit_transactions), and settling outstanding debts.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "../../../api/supabase";
import { QUERY_KEYS } from "../../../lib/queryKey";
import type { PaymentMethod } from "../../sales/types/payment";
import type { Sale } from "../../sales/types/sale";
import { getCreditHistory } from "../../sales/services/customers/customer-credit.service";

export interface CustomerDebtDetails {
  outstanding_debt: number;
  credit_limit: number;
  available_credit: number;
  unpaid_sales: Sale[];
}

export interface CreditTransactionRecord {
  id: string;
  customer_id: string;
  sale_id?: string | null;
  amount: number;
  transaction_type: "SALE" | "PAYMENT" | "REFUND" | "ADJUSTMENT";
  payment_method?: string | null;
  reference?: string | null;
  notes?: string | null;
  performed_by?: string | null;
  created_at: string;
  sale?: {
    sale_number: string;
    total_amount: number;
    payable_amount: number;
    amount_paid: number;
  } | null;
  performer?: {
    full_name: string;
    email: string;
  } | null;
}

/* -------------------------------------------------------------------------- */
/*  useCustomerDebt                                                            */
/* -------------------------------------------------------------------------- */

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

      /* ------------------------------------------------------------------
       * Step 1: Compute net outstanding debt from customer_credit_transactions.
       *
       * SUM(SALE rows) - SUM(PAYMENT rows) = actual remaining debt.
       * This is the single source of truth because sales.amount_paid is
       * frozen at initial-checkout and never mutated again.
       * ------------------------------------------------------------------ */
      const { data: creditTxs, error: creditErr } = await supabase
        .from("customer_credit_transactions")
        .select("amount, transaction_type")
        .eq("customer_id", customerId);

      let outstanding_debt = 0;
      if (!creditErr && creditTxs && creditTxs.length > 0) {
        const totalSaleDebt = creditTxs
          .filter((tx) => tx.transaction_type === "SALE")
          .reduce((sum, tx) => sum + Number(tx.amount), 0);
        const totalRepaid = creditTxs
          .filter((tx) => tx.transaction_type === "PAYMENT")
          .reduce((sum, tx) => sum + Number(tx.amount), 0);
        outstanding_debt = Math.max(0, totalSaleDebt - totalRepaid);
      } else {
        /* Fallback: if no credit transactions exist yet, derive from sales */
        const { data: fallbackSales } = await supabase
          .from("sales")
          .select("payable_amount, amount_paid, total_amount")
          .eq("customer_id", customerId)
          .eq("status", "COMPLETED");

        outstanding_debt = (fallbackSales || []).reduce((sum, s) => {
          const payable = Number(s.payable_amount || s.total_amount || 0);
          const paid = Number(s.amount_paid ?? payable);
          return sum + Math.max(0, payable - paid);
        }, 0);
      }

      /* ------------------------------------------------------------------
       * Step 2: Determine which sales still have an unpaid balance by
       * joining sale_payments to get the real total paid per sale, then
       * comparing against payable_amount.
       * ------------------------------------------------------------------ */
      const { data: salesData, error: salesErr } = await supabase
        .from("sales")
        .select(`
          *,
          items:sale_items(
            *,
            product:products(*)
          ),
          payments:sale_payments(amount)
        `)
        .eq("customer_id", customerId)
        .eq("status", "COMPLETED")
        .order("created_at", { ascending: false });

      if (salesErr) throw salesErr;

      const sales = (salesData || []) as (Sale & { payments?: { amount: number }[] })[];

      /* For each sale, real total paid = SUM of sale_payments rows (covers
         initial checkout payment + all subsequent installment repayments). */
      const unpaid_sales = sales.filter((s) => {
        const payable = Number(s.payable_amount || s.total_amount || 0);
        const totalPaid = (s.payments || []).reduce(
          (sum, p) => sum + Number(p.amount),
          0
        );
        return payable - totalPaid > 0.01;
      });

      const credit_limit = 500000;
      const available_credit = Math.max(0, credit_limit - outstanding_debt);

      return {
        outstanding_debt,
        credit_limit,
        available_credit,
        unpaid_sales: unpaid_sales as Sale[],
      };
    },
    enabled: !!customerId,
  });
}

/* -------------------------------------------------------------------------- */
/*  useCustomerCreditHistory                                                   */
/*  Fetches rows from customer_credit_transactions for this customer           */
/* -------------------------------------------------------------------------- */

export function useCustomerCreditHistory(customerId: string | null) {
  return useQuery({
    queryKey: ["customer_credit_history", customerId],
    queryFn: async (): Promise<CreditTransactionRecord[]> => {
      if (!customerId) return [];
      const history = await getCreditHistory(customerId);
      return (history || []) as CreditTransactionRecord[];
    },
    enabled: !!customerId,
  });
}

/* -------------------------------------------------------------------------- */
/*  useSettleCustomerDebt                                                      */
/* -------------------------------------------------------------------------- */

export interface SettleDebtInput {
  customerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  saleId?: string;
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

      // Resolve current staff member user ID if possible
      let performedBy: string | undefined = undefined;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        performedBy = user?.id;
      } catch {
        // Auth fallback
      }

      if (paymentMethod === "WALLET") {
        const { payOutstandingUsingWallet } = await import(
          "../../sales/services/customers/customer-finance.service"
        );
        await payOutstandingUsingWallet(customerId, amount, performedBy, saleId);
      } else {
        const { payOutstandingBalance } = await import(
          "../../sales/services/customers/customer-finance.service"
        );
        await payOutstandingBalance({
          customer_id: customerId,
          amount,
          payment_method: paymentMethod,
          notes: notes || "Customer debt settlement",
          performed_by: performedBy,
          sale_id: saleId,
        });
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
        queryKey: ["customer_credit_history", variables.customerId],
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
