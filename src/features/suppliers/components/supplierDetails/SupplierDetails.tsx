import { useState } from "react";
import type { SupplierWithStats } from "../../types/supplier";
import SupplierInformation from "../SupplierInformation";
import SupplierStats from "../SupplierStats";
import SupplierOverview from "../SupplierOverview";
import SupplierActions from "../SupplierActions";
import ProductsSuppliedTab from "./ProductsSuppliedTab";
import ActivityTab from "./ActivityTab";
import OverviewTab from "./OverviewTab";
import {
  SUPPLIER_TABS,
  SUPPLIER_TAB_LIST,
  type SupplierTab,
} from "../../constants/supplierTabs";
import PurchaseHistoryTab from "./PurchaseHistoryTabs";

interface SupplierDetailsProps {
  supplier: SupplierWithStats;
  onEdit: () => void;
  onDelete: () => void;
}

export default function SupplierDetails({
  supplier,
  onEdit,
  onDelete,
}: SupplierDetailsProps) {
  const [activeTab, setActiveTab] = useState<SupplierTab>(
    SUPPLIER_TABS.RECENT_PURCHASES,
  );

  // Helper to generate initials and color
  const getAvatarDetails = (name: string) => {
    const trimmed = name.trim();
    const parts = trimmed.split(" ");
    let initials: string;
    if (parts.length > 1) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (trimmed.length > 0) {
      initials = trimmed.slice(0, 2).toUpperCase();
    } else {
      initials = "SU";
    }

    // Assign a persistent color depending on supplier name character code
    const charCodeSum = trimmed
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300",
      "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
      "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300",
      "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
      "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300",
      "bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300",
      "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300",
      "bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300",
    ];
    const colorClass = colors[charCodeSum % colors.length];

    return { initials, colorClass };
  };

  const { initials, colorClass } = getAvatarDetails(supplier.name);

  return (
    <div className="space-y-6 h-full flex flex-col min-w-0 text-left">
      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-extrabold ${colorClass}`}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
                {supplier.name}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold truncate max-w-md">
              {supplier.remarks_text || "Food and beverage supplier"}
            </p>
          </div>
        </div>

        <SupplierActions onEdit={onEdit} onDelete={onDelete} />
      </div>

      {/* Information grid cards */}
      <SupplierInformation supplier={supplier} />

      {/* Numerical Stats grid */}
      <SupplierStats supplier={supplier} />

      {/* Timeline Descriptive stats */}
      <SupplierOverview supplier={supplier} />

      {/* Tabs navigation */}
      <div className="border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex gap-6 overflow-x-auto no-scrollbar">
          {SUPPLIER_TAB_LIST.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3.5 text-xs font-bold transition-colors relative cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? "text-indigo-600 dark:text-indigo-400 font-extrabold"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Tab content pane */}
      <div className="flex-1 min-h-0">
        {activeTab === SUPPLIER_TABS.RECENT_PURCHASES && (
          <PurchaseHistoryTab supplierId={supplier.id} />
        )}
        {activeTab === SUPPLIER_TABS.PRODUCTS_SUPPLIED && (
          <ProductsSuppliedTab supplierId={supplier.id} />
        )}
        {activeTab === SUPPLIER_TABS.CONTACT_HISTORY && (
          <ActivityTab supplier={supplier} />
        )}
        {activeTab === SUPPLIER_TABS.NOTES && (
          <OverviewTab supplier={supplier} />
        )}
      </div>
    </div>
  );
}
