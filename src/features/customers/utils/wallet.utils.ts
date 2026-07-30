import type { WalletTransaction, WalletOverviewStats } from "../types/wallet";

/**
 * Format numerical amounts to standard currency notation.
 */
export function formatCurrency(amount: number, currency = "NGN"): string {
  const formatted = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  return currency === "NGN" ? `₦${formatted}` : `${currency} ${formatted}`;
}

/**
 * Calculate expected balance after a credit or debit transaction.
 */
export function calculateBalanceAfter(
  balanceBefore: number,
  amount: number,
  direction: "credit" | "debit" | "CREDIT" | "DEBIT"
): number {
  if (direction === "credit" || direction === "CREDIT") {
    return balanceBefore + amount;
  }
  return Math.max(0, balanceBefore - amount);
}

/**
 * Returns UI styling badge classes based on transaction type.
 */
export function getBadgeColorForTransactionType(type: string): string {
  const normalized = (type || "").toLowerCase();
  switch (normalized) {
    case "deposit":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "withdrawal":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "sale_payment":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "refund":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "adjustment":
      return "bg-slate-100 text-slate-700 border-slate-300";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

/**
 * Returns UI badge styling classes based on wallet status.
 */
export function getBadgeColorForWalletStatus(status: string): string {
  return (status || "").toLowerCase() === "active"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-amber-50 text-amber-700 border-amber-200";
}

/**
 * Computes wallet metrics for today's activities.
 */
export function computeDailyWalletStats(
  wallets: { balance: number }[],
  transactions: WalletTransaction[]
): WalletOverviewStats {
  const totalWalletBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todayTxs = transactions.filter((t) => new Date(t.created_at) >= startOfToday);

  const depositsToday = todayTxs
    .filter((t) => (t.type || "").toUpperCase() === "DEPOSIT")
    .reduce((sum, t) => sum + t.amount, 0);

  const withdrawalsToday = todayTxs
    .filter((t) => (t.type || "").toUpperCase() === "WITHDRAWAL")
    .reduce((sum, t) => sum + t.amount, 0);

  const walletPaymentsToday = todayTxs
    .filter((t) => (t.type || "").toUpperCase() === "SALE_PAYMENT")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalWalletBalance,
    depositsToday,
    withdrawalsToday,
    walletPaymentsToday,
    totalTransactionsToday: todayTxs.length,
  };
}
