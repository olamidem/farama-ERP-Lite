import type { CartItem } from "../types/cart";
import type { PaymentMethod } from "../types/payment";
import { WALK_IN_CUSTOMER_ID } from "../constants";

export function validateCartCheckout(
  cart: CartItem[],
  selectedCustomerId: string,
  paymentMethod: PaymentMethod,
  payableAmount: number,
  customerWalletBalance?: number
): { isValid: boolean; error?: string } {
  if (!cart || cart.length === 0) {
    return { isValid: false, error: "Your cart is empty. Add products before checking out." };
  }

  for (const item of cart) {
    if (item.quantity <= 0) {
      return { isValid: false, error: `Invalid quantity for product "${item.name}".` };
    }
  }

  if (paymentMethod === "WALLET") {
    if (!selectedCustomerId || selectedCustomerId === WALK_IN_CUSTOMER_ID) {
      return {
        isValid: false,
        error: "A registered customer account is required when paying with Wallet.",
      };
    }

    if (customerWalletBalance !== undefined && customerWalletBalance < payableAmount) {
      return {
        isValid: false,
        error: `Insufficient customer wallet balance. Available: ₦${customerWalletBalance.toLocaleString()}, Required: ₦${payableAmount.toLocaleString()}`,
      };
    }
  }

  return { isValid: true };
}
