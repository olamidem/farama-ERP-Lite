import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { processCheckout } from "../services/checkout.service";
import { useCartStore } from "../store/cart.store";
import { validateCartCheckout } from "../utils/validation";
import type { CreateSaleInput, Sale } from "../types/sale";
import type { Customer } from "../../customers/types/customer";
import { toast } from "sonner";

export function useCheckout() {
  const queryClient = useQueryClient();
  const cartStore = useCartStore();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isHoldOpen, setIsHoldOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const checkoutMutation = useMutation({
    mutationFn: (saleInput: CreateSaleInput) => processCheckout(saleInput),
    onSuccess: (sale) => {
      toast.success(`Sale #${sale.sale_number} completed successfully!`);
      setCompletedSale(sale);
      cartStore.clearCart();
      setIsCheckoutOpen(false);
      setIsPaymentOpen(false);
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales_stats"] });
      queryClient.invalidateQueries({ queryKey: ["pos_products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer_wallets"] });
      queryClient.invalidateQueries({ queryKey: ["held_carts"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Checkout failed");
    },
  });

  const validateAndProceed = (
    selectedCustomer?: Customer | null,
    payableAmount = 0
  ) => {
    const validation = validateCartCheckout(
      cartStore.items,
      cartStore.selectedCustomerId,
      cartStore.paymentMethod,
      payableAmount,
      selectedCustomer?.wallet_balance
    );

    if (!validation.isValid) {
      toast.error(validation.error);
      return false;
    }

    return true;
  };

  return {
    isCheckoutOpen,
    setIsCheckoutOpen,
    isPaymentOpen,
    setIsPaymentOpen,
    isDiscountOpen,
    setIsDiscountOpen,
    isHoldOpen,
    setIsHoldOpen,
    completedSale,
    setCompletedSale,
    validateAndProceed,
    checkout: checkoutMutation.mutateAsync,
    isCheckingOut: checkoutMutation.isPending,
  };
}
