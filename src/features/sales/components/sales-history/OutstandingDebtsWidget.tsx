import { useState } from "react";
import { Receipt, CheckCircle2 } from "lucide-react";
import type { Sale } from "../../types/sale";
import { formatCurrency } from "../../utils/pricing";
import PaymentUpdateModal from "../checkout/PaymentUpdateModal";

interface OutstandingDebtsWidgetProps {
  sales: Sale[];
  isLoading?: boolean;
  onSelectSale?: (sale: Sale) => void;
}

export const OutstandingDebtsWidget = ({
  sales,
  isLoading,
  onSelectSale,
}: OutstandingDebtsWidgetProps) => {
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<Sale | null>(null);

  // Filter sales with outstanding balance
  const unpaidSales = sales.filter((s) => {
    if (s.status !== "COMPLETED") return false;
    const paid = Number(s.amount_paid ?? s.payable_amount ?? 0);
    const payable = Number(s.payable_amount ?? 0);
    return payable - paid > 0;
  });

  const totalOutstanding = unpaidSales.reduce((acc, s) => {
    const paid = Number(s.amount_paid ?? s.payable_amount ?? 0);
    const payable = Number(s.payable_amount ?? 0);
    return acc + Math.max(0, payable - paid);
  }, 0);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 animate-pulse">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 w-48 rounded-lg mb-3"></div>
        <div className="h-16 bg-slate-100 dark:bg-slate-900 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-rose-200/80 dark:border-rose-900/50 shadow-2xs overflow-hidden">
      {/* Widget Header */}
      <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border-b border-rose-100 dark:border-rose-900/40 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500 text-white shadow-2xs flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Outstanding Customer Debts
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Summary of unpaid and partially paid customer balances (Click row for receipt & details)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold text-rose-500 uppercase block">Total Outstanding</span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(totalOutstanding)}
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-extrabold text-xs">
            {unpaidSales.length} {unpaidSales.length === 1 ? "Sale" : "Sales"}
          </span>
        </div>
      </div>

      {/* Widget Content */}
      {unpaidSales.length === 0 ? (
        <div className="p-6 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            All customer sales are fully settled!
          </p>
          <p className="text-[11px] text-slate-400">
            There are currently no active transactions with unpaid balances.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-80 overflow-y-auto">
          {unpaidSales.map((s) => {
            const paid = Number(s.amount_paid ?? s.payable_amount ?? 0);
            const payable = Number(s.payable_amount ?? 0);
            const balance = Math.max(0, payable - paid);

            return (
              <div
                key={s.id}
                onClick={() => onSelectSale?.(s)}
                className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-blue-50/50 dark:hover:bg-slate-900/60 cursor-pointer transition-colors text-xs group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                      #{s.sale_number}
                    </span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100 truncate">
                      {s.customer_name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{new Date(s.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Paid: {formatCurrency(paid)} of {formatCurrency(payable)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">Balance</span>
                    <span className="font-black text-rose-600 dark:text-rose-400 text-xs">
                      {formatCurrency(balance)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedSaleForPayment(s)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1"
                      title="Record Payment"
                    >
                      <span className="font-extrabold text-xs">₦</span>
                      <span>Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectSale?.(s)}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-all"
                      title="View Sale Details & Receipt"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedSaleForPayment && (
        <PaymentUpdateModal
          isOpen={!!selectedSaleForPayment}
          onClose={() => setSelectedSaleForPayment(null)}
          sale={selectedSaleForPayment}
        />
      )}
    </div>
  );
};

export default OutstandingDebtsWidget;
