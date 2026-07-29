import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { formatDate } from "../../../../utils/formatDate";
import { useSupplierPurchases } from "../../hooks/useSupplierPurchase";
import { formatCurrency } from "../../../../utils/formatCurrenty";
import getStatusBadgeClass from "../../utils/statusBadge";
import getStatusLabel from "../../utils/statusLabel";

interface PurchaseHistoryTabProps {
  supplierId: string;
}

interface PurchaseRecord {
  id: string;
  purchase_number?: string;
  purchase_date?: string;
  created_at: string;
  status: string;
  total_amount?: number;
  items?: Array<{ id: string }>;
}

export default function PurchaseHistoryTab({
  supplierId,
}: PurchaseHistoryTabProps) {
  const { data: purchases = [], isLoading } = useSupplierPurchases(
    supplierId,
  ) as { data: PurchaseRecord[] | undefined; isLoading: boolean };


  if (isLoading) {
    return (
      <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
        Loading purchase history...
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
        No purchase history found for this supplier.
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between pb-1">
        <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
          Recent Purchases
        </h4>
        <Link
          to="/purchases"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition shadow-2xs"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800 shadow-2xs">
        <table className="w-full text-left border-collapse bg-white dark:bg-slate-900">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/30 dark:bg-slate-800/30">
              <th className="py-3.5 px-4 font-bold">Purchase Number</th>
              <th className="py-3.5 px-4 font-bold">Date</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold">Items</th>
              <th className="py-3.5 px-4 text-right font-bold">Total Amount</th>
              <th className="py-3.5 px-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-[13px]">
            {purchases.slice(0, 5).map((purchase) => {
              const itemsCount = purchase.items?.length || 0;
              return (
                <tr
                  key={purchase.id}
                  className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">
                    <Link to="/purchases" className="hover:underline">
                      {purchase.purchase_number ||
                        `PO-${purchase.id.slice(0, 8)}`}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                    {formatDate(purchase.purchase_date || purchase.created_at)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${getStatusBadgeClass(purchase.status)}`}
                    >
                      {getStatusLabel(purchase.status)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {itemsCount} {itemsCount === 1 ? "item" : "items"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(purchase.total_amount || 0)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to="/purchases"
                      className="inline-flex text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                      title="View purchase details"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
