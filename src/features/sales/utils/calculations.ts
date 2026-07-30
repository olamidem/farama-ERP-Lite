import type { CartItem } from "../types/cart";

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
}

export function calculateDiscount(
  subtotal: number,
  discountValue: number,
  isPercentage = true
): number {
  if (discountValue <= 0) return 0;
  if (isPercentage) {
    return Math.min(subtotal, (subtotal * discountValue) / 100);
  }
  return Math.min(subtotal, discountValue);
}

export function calculateTax(
  subtotalAfterDiscount: number,
  taxRatePercentage: number
): number {
  if (taxRatePercentage <= 0) return 0;
  return (subtotalAfterDiscount * taxRatePercentage) / 100;
}

export function calculatePayableAmount(
  subtotal: number,
  discountAmount: number,
  taxAmount: number
): number {
  return Math.max(0, subtotal - discountAmount + taxAmount);
}

export function calculateChangeDue(
  amountPaid: number,
  totalPayable: number
): number {
  return Math.max(0, amountPaid - totalPayable);
}
