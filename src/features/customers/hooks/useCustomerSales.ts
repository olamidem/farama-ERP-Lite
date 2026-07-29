import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../api/supabase";

export interface CustomerSale {
  id: string;
  invoice_number?: string;
  created_at?: string;
  sale_date?: string;
  payment_method?: string;
  total_amount: number | string;
  status?: string;
  customer_id?: string;
}

export function useCustomerSales(activeCustomerId: string | null) {
  return useQuery({
    queryKey: ["customer_sales", activeCustomerId],
    queryFn: async (): Promise<CustomerSale[]> => {
      if (!activeCustomerId) return [];
      try {
        const { data, error } = await supabase
          .from("sales")
          .select("*")
          .eq("customer_id", activeCustomerId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      } catch {
        const stored = localStorage.getItem("farama_pos_sales");
        if (stored) {
          const parsed = JSON.parse(stored) as CustomerSale[];
          return parsed.filter((s) => s.customer_id === activeCustomerId);
        }
        return [];
      }
    },
    enabled: !!activeCustomerId,
  });
}
