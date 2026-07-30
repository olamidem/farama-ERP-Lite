import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "../store/cart.store";
import {
  calculateSubtotal,
  calculateDiscount,
  calculateTax,
  calculatePayableAmount,
} from "../utils/calculations";
import { saveHeldCart, getHeldCarts, deleteHeldCart } from "../services/cart.service";
import { toast } from "sonner";

export function useCart() {
  const queryClient = useQueryClient();
  const store = useCartStore();

  const subtotal = useMemo(() => calculateSubtotal(store.items), [store.items]);

  const discountAmount = useMemo(
    () =>
      calculateDiscount(
        subtotal,
        store.discountVal,
        store.discountType === "percentage"
      ),
    [subtotal, store.discountVal, store.discountType]
  );

  const subtotalAfterDiscount = useMemo(
    () => Math.max(0, subtotal - discountAmount),
    [subtotal, discountAmount]
  );

  const taxAmount = useMemo(
    () => calculateTax(subtotalAfterDiscount, store.taxRate),
    [subtotalAfterDiscount, store.taxRate]
  );

  const payableAmount = useMemo(
    () => calculatePayableAmount(subtotal, discountAmount, taxAmount),
    [subtotal, discountAmount, taxAmount]
  );

  const totalItemCount = useMemo(
    () => store.items.reduce((sum, item) => sum + item.quantity, 0),
    [store.items]
  );

  // Held Carts Queries & Mutations
  const { data: heldCarts = [], isLoading: isHeldCartsLoading } = useQuery({
    queryKey: ["held_carts"],
    queryFn: getHeldCarts,
  });

  const holdCartMutation = useMutation({
    mutationFn: async (notes?: string) => {
      if (store.items.length === 0) throw new Error("Cannot hold an empty cart.");
      return saveHeldCart(
        {
          customer_id: store.selectedCustomerId,
          notes: notes || store.remarks,
          subtotal,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          total_amount: payableAmount,
          payment_method: store.paymentMethod,
        },
        store.items
      );
    },
    onSuccess: () => {
      toast.success("Cart held successfully");
      store.clearCart();
      queryClient.invalidateQueries({ queryKey: ["held_carts"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to hold cart");
    },
  });

  const deleteHeldCartMutation = useMutation({
    mutationFn: deleteHeldCart,
    onSuccess: () => {
      toast.success("Held cart removed");
      queryClient.invalidateQueries({ queryKey: ["held_carts"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete held cart");
    },
  });

  return {
    ...store,
    subtotal,
    discountAmount,
    taxAmount,
    payableAmount,
    totalItemCount,
    heldCarts,
    isHeldCartsLoading,
    holdCart: holdCartMutation.mutateAsync,
    isHoldingCart: holdCartMutation.isPending,
    deleteHeldCart: deleteHeldCartMutation.mutateAsync,
  };
}
