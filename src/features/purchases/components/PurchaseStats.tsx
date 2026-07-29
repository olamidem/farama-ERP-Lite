import { ShoppingBag, Clock, PackageCheck, CreditCard } from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrenty";
import { usePurchaseStats } from "../hook/usePurchases";

export default function PurchaseStats() {
  const { data: stats, isLoading } = usePurchaseStats();
  const cards = [
    {
      title: "Total Orders",
      value: isLoading ? "..." : stats?.totalOrders,
      label: "All time",
      icon: ShoppingBag,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50/50 dark:bg-blue-950/60",
    },
    {
      title: "Pending",
      value: isLoading ? "..." : stats?.pendingOrders,
      label: "Awaiting action",
      icon: Clock,
      iconColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50/50 dark:bg-amber-950/60",
    },
    {
      title: "Received",
      value: isLoading ? "..." : stats?.receivedOrders,
      label: "Completed",
      icon: PackageCheck,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50/50 dark:bg-emerald-950/60",
    },
    {
      title: "Total Purchase Value",
      value: isLoading ? "..." : formatCurrency(stats?.totalPurchaseValue ?? 0),
      label: "All time",
      icon: CreditCard,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50/50 dark:bg-purple-950/60",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="flex items-center gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-3xs hover:shadow-2xs transition-all duration-300"
          >
            {/* Left side: Icon inside shaded rounded container */}
            <div
              className={`p-3.5 rounded-xl ${card.bgColor} ${card.iconColor} shrink-0`}
            >
              <Icon size={20} className="stroke-[2.2]" />
            </div>

            {/* Right side: Title, Value, Subtitle */}
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block leading-none">
                {card.title}
              </span>
              <span className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight block mt-1.5 truncate leading-none">
                {card.value}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block mt-1 leading-none">
                {card.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
