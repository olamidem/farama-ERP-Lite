export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function calculateItemTotal(
  unitPrice: number,
  quantity: number,
  discount = 0
): number {
  const lineTotal = unitPrice * quantity;
  return Math.max(0, lineTotal - discount);
}
