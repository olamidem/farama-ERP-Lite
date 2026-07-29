import { ShoppingBag } from "lucide-react";
import DataTable from "../../../../components/ui/DataTable/DataTable";
import type { Purchase } from "../../types/purchase";
import { purchaseItemsColumns } from "./purchaseItemsColums";
import { formatCurrency } from "../../../../utils/formatCurrenty";

interface PurchaseItemsTableProps {
  purchase: Purchase;
}

const PurchaseItemsTable = ({ purchase }: PurchaseItemsTableProps) => {
  const items = purchase.items ?? [];

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-3xs transition-colors">
      <h4 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
        <ShoppingBag size={14} className="text-blue-500 dark:text-blue-400" />
        <span>Purchase Items</span>
      </h4>

      <DataTable
        data={items}
        columns={purchaseItemsColumns}
        isLoading={false}
        emptyTitle="No Purchase Items"
        emptyDescription="This purchase does not contain any products."
      />

      {items.length > 0 && (
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Grand Total
          </span>

          <span className="font-sans text-base font-black text-blue-600 dark:text-blue-400">
            {formatCurrency(purchase.total_amount)}
          </span>
        </div>
      )}
    </div>
  );
};

export default PurchaseItemsTable;
