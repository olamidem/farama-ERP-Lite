import {
  Package,
  AlertTriangle,
  Layers,
  Banknote,
  ArrowLeftRight,
} from "lucide-react";
import type { InventorySummary } from "../../types/inventory";
import type { InventoryTransactionWithRelations } from "../../types/inventoryTransaction";
import MiniLiveChart from "./MiniLiveChart";
import { formatNumber } from "../../../../utils/formatNumber";
import { formatCurrency } from "../../../../utils/formatCurrenty";

interface InventorySummaryCardsProps {
  summary?: InventorySummary;
  isLoading?: boolean;
  transactions?: InventoryTransactionWithRelations[];
}

export const InventorySummaryCards = ({
  summary = {
    totalProducts: 0,
    lowStockItems: 0,
    totalStockAllUnits: 0,
    totalInventoryValue: 0,
  },
  isLoading = false,
  transactions = [],
}: InventorySummaryCardsProps) => {
  // Calculate Today's Stock Movements
  const todayStr = new Date().toDateString();
  const todayTxs = transactions.filter((t) => {
    if (!t.created_at) return false;
    return new Date(t.created_at).toDateString() === todayStr;
  });

  const todayMovesCount = todayTxs.length;
  const todayNetQty = todayTxs.reduce((sum, tx) => sum + (tx.quantity || 0), 0);
  const netSign = todayNetQty > 0 ? "+" : "";

  const cards = [
    {
      title: "TOTAL PRODUCTS",
      value: formatNumber(summary.totalProducts),
      numericValue: summary.totalProducts,
      subtitle: "All products",
      icon: Package,
      iconColor: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900/50",
      sparklineColor: "#4f46e5",
    },
    {
      title: "LOW STOCK ITEMS",
      value: formatNumber(summary.lowStockItems),
      numericValue: summary.lowStockItems,
      subtitle: "Need attention",
      icon: AlertTriangle,
      iconColor: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/50",
      sparklineColor: "#d97706",
    },
    {
      title: "TOTAL STOCK (ALL UNITS)",
      value: formatNumber(summary.totalStockAllUnits),
      numericValue: summary.totalStockAllUnits,
      subtitle: "All units in stock",
      icon: Layers,
      iconColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/50",
      sparklineColor: "#059669",
    },
    {
      title: "INVENTORY VALUE",
      value: formatCurrency(summary.totalInventoryValue),
      numericValue: summary.totalInventoryValue,
      subtitle: "Total inventory value",
      icon: Banknote,
      iconColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/50",
      sparklineColor: "#2563eb",
    },
    {
      title: "TODAY'S STOCK MOVEMENTS",
      value: `${todayMovesCount} move${todayMovesCount !== 1 ? "s" : ""}`,
      numericValue: todayMovesCount,
      subtitle: `${netSign}${todayNetQty} net units today`,
      icon: ArrowLeftRight,
      iconColor: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-900/50",
      sparklineColor: "#8b5cf6",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="mt-4 h-8 w-32 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="mt-2 h-4 w-16 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="mt-4 h-10 w-full rounded bg-slate-50 dark:bg-slate-800/50" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                    {card.title}
                  </span>
                  <div className="mt-1">
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                      {card.value}
                    </h3>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mt-2">
                      {card.subtitle}
                    </span>
                  </div>
                </div>
                <div
                  className={`rounded-full p-2.5 border shrink-0 flex items-center justify-center h-12 w-12 ${card.iconColor}`}
                >
                  <Icon size={20} />
                </div>
              </div>
            </div>

            {/* Live Chart component */}
            <MiniLiveChart
              title={card.title}
              currentValue={card.numericValue}
              color={card.sparklineColor}
            />
          </div>
        );
      })}
    </div>
  );
};

export default InventorySummaryCards;
