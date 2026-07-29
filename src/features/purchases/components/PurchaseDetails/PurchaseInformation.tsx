import { ClipboardList, User } from "lucide-react";
import type { Purchase } from "../../types/purchase";
import { formatDate } from "../../../../utils/formatDate";

interface PurchaseInformationProps {
  purchase: Purchase;
}

const PurchaseInformation = ({ purchase }: PurchaseInformationProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Supplier */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-3xs transition-colors">
        <h4 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
          <User size={14} className="text-blue-500 dark:text-blue-400" />
          <span>Supplier Information</span>
        </h4>

        <div className="space-y-3.5 text-xs">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 font-semibold">Supplier Name</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-left sm:text-right">
              {purchase.supplier?.name ?? "Unknown"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 font-semibold">Phone</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 text-left sm:text-right">
              {purchase.supplier?.phone ?? "+234 810 123 4567"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 font-semibold">Email</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 break-all text-left sm:text-right max-w-full sm:max-w-50">
              {purchase.supplier?.email ?? "contact@nestle.com"}
            </span>
          </div>
        </div>
      </div>

      {/* Purchase */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-3xs transition-colors">
        <h4 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
          <ClipboardList size={14} className="text-blue-500 dark:text-blue-400" />
          <span>Purchase Information</span>
        </h4>

        <div className="space-y-3.5 text-xs">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 font-semibold">Purchase Date</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-left sm:text-right">
              {formatDate(purchase.purchase_date)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 font-semibold">
              Expected Delivery
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-left sm:text-right">
              {formatDate(purchase.expected_delivery_date)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 font-semibold">Created By</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-left sm:text-right">
              {purchase.created_by || "Admin User"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseInformation;
