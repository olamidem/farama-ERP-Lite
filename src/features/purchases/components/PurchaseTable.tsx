import { useMemo, useState } from "react";
import DataTable from "../../../components/ui/DataTable/DataTable";
import { createPurchaseColumns } from "./purchaseColumns";
import type { Purchase } from "../types/purchase";
import Pagination from "../../../components/ui/pagination/Pagination";

interface PurchaseTableProps {
  purchases: Purchase[];
  isLoading: boolean;
  onView: (purchase: Purchase) => void;
  onEdit: (purchase: Purchase) => void;
  onDelete: (id: string) => void;
  isCompact?: boolean;
}

const PurchaseTableSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-3xs animate-pulse transition-colors">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">PO Number</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Supplier</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Expected Delivery</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Total Amount</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Received %</th>
              <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4.5">
                  <div className="h-4.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                </td>
                <td className="px-6 py-4.5">
                  <div className="h-4.5 w-36 bg-slate-200 dark:bg-slate-800 rounded-md" />
                </td>
                <td className="px-6 py-4.5">
                  <div className="h-4 w-20 bg-slate-150 dark:bg-slate-800 rounded" />
                </td>
                <td className="px-6 py-4.5">
                  <div className="h-4 w-24 bg-slate-150 dark:bg-slate-800 rounded" />
                </td>
                <td className="px-6 py-4.5 text-right">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded ml-auto" />
                </td>
                <td className="px-6 py-4.5">
                  <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
                </td>
                <td className="px-6 py-4.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="h-3 w-6 bg-slate-150 dark:bg-slate-800 rounded" />
                  </div>
                </td>
                <td className="px-6 py-4.5 text-right">
                  <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-lg ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PurchaseTable = ({
  purchases = [],
  isLoading,
  onView,
  onEdit,
  onDelete,
  isCompact = false,
}: PurchaseTableProps) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedPurchases = useMemo(() => {
    const start = (page - 1) * pageSize;
    const safePurchases = purchases || [];

    return safePurchases.slice(start, start + pageSize);
  }, [purchases, page, pageSize]);

  const columns = useMemo(
    () =>
      createPurchaseColumns({
        onView,
        onEdit,
        onDelete,
        isCompact,
      }),
    [onView, onEdit, onDelete, isCompact],
  );

  if (isLoading) {
    return <PurchaseTableSkeleton />;
  }

  const safePurchasesCount = (purchases || []).length;

  return (
    <div className="space-y-5">
      <DataTable
        data={paginatedPurchases}
        columns={columns}
        isLoading={false}
        emptyTitle="No purchase orders"
        emptyDescription="Create your first purchase order to get started."
      />

      {!isLoading && safePurchasesCount > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={safePurchasesCount}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          itemName="purchase orders"
        />
      )}
    </div>
  );
};

export default PurchaseTable;
