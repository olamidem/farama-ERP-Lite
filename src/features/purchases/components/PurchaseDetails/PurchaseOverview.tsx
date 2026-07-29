import { useState } from "react";
import { X, PackageCheck, AlertCircle, Printer, Lock } from "lucide-react";
import { toast } from "sonner";
import type { Purchase } from "../../types/purchase";
import {
  getStatusBadgeStyle,
  formatStatusText,
} from "../../utils/purchaseStatus";
import PurchaseInformation from "./PurchaseInformation";
import {
  PURCHASE_OVERVIEW_TABS,
  type PurchaseOverviewTab,
} from "../../constant/purchaseOverview.constants";
import PurchaseItemsTable from "./PurchaseItemsTable";
import PurchaseTimeline from "./PurchaseTimeline";
import PurchaseActions from "./PurchaseActions";
import ReceiveGoodsModal from "../PurchaseForm/ReceiveGoodsModal/ReceiveGoodModal";
import { printPurchaseOrder } from "../../utils/printPurchaseOrder";
import { useClosePurchase } from "../../hook/usePurchasesMutations";

interface PurchaseOverviewProps {
  purchase: Purchase;
  onClose: () => void;
  onEdit: (purchase: Purchase) => void;
}

export const PurchaseOverview = ({
  purchase,
  onClose,
  onEdit,
}: PurchaseOverviewProps) => {
  const [activeTab, setActiveTab] = useState<PurchaseOverviewTab>(
    PURCHASE_OVERVIEW_TABS.OVERVIEW,
  );
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const closeMutation = useClosePurchase();

  const handleClosePurchase = async () => {
    if (
      window.confirm(
        `Are you sure you want to CLOSE purchase order ${purchase.purchase_number}? This will permanently lock further modifications and receiving goods.`,
      )
    ) {
      try {
        await closeMutation.mutateAsync(purchase.id);
      } catch {
        toast.error("Failed to close purchase order.");
      }
    }
  };

  const tabs = [
    {
      id: PURCHASE_OVERVIEW_TABS.OVERVIEW,
      label: "Overview",
    },
    {
      id: PURCHASE_OVERVIEW_TABS.ITEMS,
      label: "Items",
    },
    {
      id: PURCHASE_OVERVIEW_TABS.RECEIVE,
      label: "Receive Goods",
    },
    {
      id: PURCHASE_OVERVIEW_TABS.HISTORY,
      label: "History",
    },
  ] as const;

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl flex flex-col w-full transition-colors">
      {/* Top Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {purchase.purchase_number}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${getStatusBadgeStyle(
              purchase.status,
            )}`}
          >
            {formatStatusText(purchase.status)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => printPurchaseOrder(purchase)}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-slate-800"
            title="Print Purchase Order / Download PDF"
          >
            <Printer size={14} />
            <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300">
              Print/PDF
            </span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
            title="Close details"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer -mb-px ${
                isActive
                  ? "border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-extrabold"
                  : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {activeTab === PURCHASE_OVERVIEW_TABS.OVERVIEW && (
          <div className="space-y-4">
            <PurchaseInformation purchase={purchase} />
            <PurchaseItemsTable purchase={purchase} />
            <PurchaseTimeline purchase={purchase} />
          </div>
        )}

        {activeTab === PURCHASE_OVERVIEW_TABS.ITEMS && (
          <div className="space-y-4">
            <PurchaseItemsTable purchase={purchase} />
          </div>
        )}

        {activeTab === PURCHASE_OVERVIEW_TABS.RECEIVE && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs transition-colors">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mb-2 uppercase tracking-wider flex items-center gap-2">
                <PackageCheck size={14} className="text-emerald-500 dark:text-emerald-400" />
                <span>Receive Goods Workflow</span>
              </h4>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed mb-4">
                Record actual stock arrived at the warehouse. This increments
                real system stock counts automatically.
              </p>

              {purchase.status === "CLOSED" ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex gap-3 text-xs">
                  <Lock size={16} className="shrink-0 text-slate-400 dark:text-slate-500 mt-0.5" />
                  <div className="font-semibold leading-relaxed">
                    This purchase order is locked and closed. Further goods
                    reception is disabled.
                  </div>
                </div>
              ) : purchase.status === "RECEIVED" ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex gap-3 text-xs">
                  <PackageCheck size={16} className="shrink-0" />
                  <div className="font-semibold">
                    All items on this purchase order have been fully received.
                    Stock balances have been updated.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/50 flex gap-3 text-indigo-800 dark:text-indigo-300">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span className="text-[10px] font-semibold leading-relaxed">
                      This purchase is currently{" "}
                      <span className="font-bold">
                        {purchase.received_percentage}%
                      </span>{" "}
                      received. Click below to register more items.
                    </span>
                  </div>

                  <button
                    onClick={() => setIsReceiveModalOpen(true)}
                    type="button"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-sm shadow-indigo-500/10 hover:shadow-indigo-500/20"
                  >
                    Open Receive Dialog
                  </button>
                </div>
              )}

              {/* Metadata Indicators: Last Received Date & Received By */}
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold block text-[9px] uppercase tracking-wider">
                    Last Received Date
                  </span>
                  <span className="text-slate-700 dark:text-slate-200 font-extrabold block mt-1">
                    {purchase.received_percentage &&
                    purchase.received_percentage > 0
                      ? new Date(purchase.updated_at).toLocaleDateString(
                          "en-US",
                          { dateStyle: "medium" },
                        )
                      : "No items received yet"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold block text-[9px] uppercase tracking-wider">
                    Received By
                  </span>
                  <span className="text-slate-700 dark:text-slate-200 font-extrabold block mt-1">
                    {purchase.received_percentage &&
                    purchase.received_percentage > 0
                      ? "olamXii@gmail.com"
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === PURCHASE_OVERVIEW_TABS.HISTORY && (
          <div className="space-y-4">
            <PurchaseTimeline purchase={purchase} />
          </div>
        )}
      </div>

      {/* Footer sticky actions */}
      <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <PurchaseActions
          purchase={purchase}
          onEdit={() => onEdit(purchase)}
          onReceive={() => setIsReceiveModalOpen(true)}
          onClosePurchase={handleClosePurchase}
        />
      </div>

      {/* Receive Goods modal */}
      <ReceiveGoodsModal
        purchase={purchase}
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
      />
    </div>
  );
};

export default PurchaseOverview;
