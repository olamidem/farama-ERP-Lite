import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSales,
  getSale,
  createSale,
  refundSale,
  getSalesStats,
  getPOSProducts,
} from "../services/sales.service";
import type { CreateSaleInput } from "../types/sale";
import { toast } from "sonner";

export function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: getSales,
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: ["sales", id],
    queryFn: () => getSale(id),
    enabled: !!id,
  });
}

export function useSalesStats() {
  return useQuery({
    queryKey: ["sales_stats"],
    queryFn: getSalesStats,
  });
}

export function usePOSProducts() {
  return useQuery({
    queryKey: ["pos_products"],
    queryFn: getPOSProducts,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSaleInput) => createSale(input),
    onSuccess: (sale) => {
      toast.success(`Sale ${sale.sale_number} created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales_stats"] });
      queryClient.invalidateQueries({ queryKey: ["pos_products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to process sale");
    },
  });
}

export function useRefundSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => refundSale(id),
    onSuccess: (sale) => {
      toast.success(`Sale ${sale.sale_number} refunded successfully!`);
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales_stats"] });
      queryClient.invalidateQueries({ queryKey: ["pos_products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to refund sale");
    },
  });
}
