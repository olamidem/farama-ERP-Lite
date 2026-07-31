export const WALK_IN_CUSTOMER_ID = "walk-in-customer";
export const DEFAULT_TAX_RATE = 0;

export const PAYMENT_METHOD_DETAILS: Record<
  string,
  { label: string; description: string; badgeBg: string }
> = {
  CASH: { label: "Cash", description: "Pay with physical cash", badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  POS: { label: "POS / Card", description: "Pay via POS terminal", badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  CARD: { label: "Card", description: "Pay via Card", badgeBg: "bg-blue-50 text-blue-700 border-blue-200" },
  TRANSFER: { label: "Bank Transfer", description: "Direct bank transfer", badgeBg: "bg-purple-50 text-purple-700 border-purple-200" },
  BANK_TRANSFER: { label: "Bank Transfer", description: "Direct bank transfer", badgeBg: "bg-purple-50 text-purple-700 border-purple-200" },
  WALLET: { label: "Customer Wallet", description: "Deduct from customer wallet", badgeBg: "bg-amber-50 text-amber-700 border-amber-200" },
  SPLIT: { label: "Split Payment", description: "Pay using multiple methods", badgeBg: "bg-slate-50 text-slate-700 border-slate-200" },
  DEPOSIT: { label: "Deposit", description: "Pay via deposit", badgeBg: "bg-teal-50 text-teal-700 border-teal-200" },
};
