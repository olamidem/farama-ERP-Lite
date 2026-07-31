import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../api/supabase";
import type { Sale } from "../../sales/types/sale";

export type CustomerSale = Sale;

export function useCustomerSales(activeCustomerId: string | null) {
  return useQuery({
    queryKey: ["customer_sales", activeCustomerId],
    queryFn: async (): Promise<Sale[]> => {
      if (!activeCustomerId) return [];
      try {
        const { data, error } = await supabase
          .from("sales")
          .select(`
            *,
            items:sale_items(
              *,
              product:products(*),
              product_unit:product_units(
                *,
                unit:units(*)
              )
            )
          `)
          .eq("customer_id", activeCustomerId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return (data || []) as Sale[];
      } catch {
        const stored = localStorage.getItem("farama_pos_sales");
        if (stored) {
          const parsed = JSON.parse(stored) as Sale[];
          return parsed.filter((s) => s.customer_id === activeCustomerId);
        }
        return [];
      }
    },
    enabled: !!activeCustomerId,
  });
}

