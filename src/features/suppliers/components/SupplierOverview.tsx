import { Calendar, Receipt, CreditCard, ShieldCheck } from "lucide-react";
import type { SupplierWithStats } from "../types/supplier";
import { formatDate } from "../../../utils/formatDate";
import { formatCurrency } from "../../../utils/formatCurrenty";
import { getRelativeTimeText } from "../utils/getRelativeTimeText";

interface SupplierOverviewProps {
  supplier: SupplierWithStats;
}

export default function SupplierOverview({ supplier }: SupplierOverviewProps) {

  const overviewCards = [
    {
      label: "Last Purchase",
      value: supplier.lastPurchaseDate ? formatDate(supplier.lastPurchaseDate) : "No purchases",
      subtext: supplier.lastPurchaseDate ? getRelativeTimeText(supplier.lastPurchaseDate, "days") : "N/A",
      icon: Calendar,
    },
    {
      label: "Average Order Value",
      value: formatCurrency(supplier.averageOrderValue),
      subtext: `Based on ${supplier.totalPurchases} orders`,
      icon: Receipt,
    },
    {
      label: "Payment Terms",
      value: "000",
      subtext: "30 days payment window",
      icon: CreditCard,
    },
    {
      label: "Supplier Since",
      value: formatDate(supplier.supplierSince),
      subtext: getRelativeTimeText(supplier.supplierSince, "since"),
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
      {overviewCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 p-4"
          >
            <div className="flex items-start gap-2.5">
              <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {card.label}
                </p>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-tight mt-1.5 truncate">
                  {card.value}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                  {card.subtext}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
