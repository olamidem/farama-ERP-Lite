import {
  ShoppingCart,
  Receipt,
  RotateCcw,
  Sliders,
  AlertTriangle,
  ArrowRightLeft,
  PackagePlus,
} from "lucide-react";

export const TransactionTypesCard = () => {
  const types = [
    {
      label: "PURCHASE",
      desc: "Stock received from supplier",
      icon: PackagePlus,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/50",
    },
    {
      label: "SALE",
      desc: "Stock sold to customer",
      icon: ShoppingCart,
      color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-100 dark:border-rose-900/50",
    },
    {
      label: "RETURN",
      desc: "Customer returned item",
      icon: RotateCcw,
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/50",
    },
    {
      label: "ADJUSTMENT",
      desc: "Manual stock adjustment",
      icon: Sliders,
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/50",
    },
    {
      label: "DAMAGE",
      desc: "Damaged or expired items",
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border-red-100 dark:border-red-900/50",
    },
    {
      label: "TRANSFER",
      desc: "Stock transferred",
      icon: ArrowRightLeft,
      color: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 border-violet-100 dark:border-violet-900/50",
    },
    {
      label: "OPENING STOCK",
      desc: "Initial stock entry",
      icon: Receipt,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900/50",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 transition-colors">
      <h4 className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 text-sm">
        Transaction Types
      </h4>
      <div className="space-y-4">
        {types.map((t, idx) => {
          const Icon = t.icon;
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className={`rounded-full p-2 border shrink-0 flex items-center justify-center h-9 w-9 ${t.color}`}>
                <Icon size={14} />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold tracking-wider text-slate-700 dark:text-slate-300 block uppercase">
                  {t.label}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block leading-tight">
                  {t.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionTypesCard;
