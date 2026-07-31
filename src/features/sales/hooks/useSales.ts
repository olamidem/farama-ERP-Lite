import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSales,
  getSale,
  createSale,
  refundSale,
  getSalesStats,
  getPOSProducts,
  updateSalePayment,
} from "../services/sales/sales.service";
import type { CreateSaleInput, Sale } from "../types/sale";
import type { PaymentMethod } from "../types/payment";
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
    onSuccess: (sale: Sale) => {
      toast.success(`Sale ${sale.sale_number || "completed"} created successfully!`);
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
    onSuccess: (sale: Sale) => {
      toast.success(`Sale ${sale.sale_number || "refunded"} refunded successfully!`);
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

export function useUpdateSalePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      saleId,
      amount,
      paymentMethod,
      notes,
    }: {
      saleId: string;
      amount: number;
      paymentMethod: PaymentMethod;
      notes?: string;
    }) => updateSalePayment(saleId, amount, paymentMethod, notes),
    onSuccess: (sale: Sale) => {
      toast.success(`Payment recorded for sale #${sale.sale_number}!`);
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales_stats"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record payment update");
    },
  });
}
