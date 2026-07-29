import { ShoppingCart, Clock, Package, Wallet } from "lucide-react";
import type { SupplierWithStats } from "../types/supplier";
import { formatCurrency } from "../../../utils/formatCurrenty";

interface SupplierStatsProps {
  supplier: SupplierWithStats;
}

export default function SupplierStats({ supplier }: SupplierStatsProps) {
  // Format currency (PHP as shown in the mockup ₱ or standard locale)
 
  const stats = [
    {
      label: "Total Purchases",
      value: supplier.totalPurchases,
      subtext: "All time purchases",
      icon: ShoppingCart,
      iconBg: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Total Spend",
      value: formatCurrency(supplier.totalSpend),
      subtext: "All time",
      icon: Wallet,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Pending Purchases",
      value: supplier.pendingPurchases,
      subtext: "Awaiting delivery",
      icon: Clock,
      iconBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Products Supplied",
      value: supplier.productsSupplied,
      subtext: "Unique products",
      icon: Package,
      iconBg: "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-5 flex items-center gap-4 shadow-2xs hover:shadow-xs transition duration-200"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.iconBg}`}
            >
              <Icon className="h-5.5 w-5.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1 truncate">
                {stat.value}
              </p>
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                {stat.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
