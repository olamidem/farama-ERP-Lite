import type { ColumnDef } from "@tanstack/react-table";
import type { PurchaseItem } from "../../types/purchaseItem";

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const purchaseItemsColumns: ColumnDef<PurchaseItem>[] = [
  {
    accessorKey: "product",
    header: "PRODUCT",
    cell: ({ row }) => (
      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
        {row.original.product?.name ?? "Unknown Product"}
      </span>
    ),
  },

  {
    accessorKey: "product_unit",
    header: "UNIT",
    cell: ({ row }) => {
      const unitName = (row.original.product_unit as unknown as { unit?: { name: string } })?.unit?.name ?? "Carton";
      return <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs">{unitName}</span>;
    },
  },

  {
    accessorKey: "quantity",
    header: "QTY",
    cell: ({ row }) => (
      <div className="text-left font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
        {row.original.quantity}
      </div>
    ),
  },

  {
    accessorKey: "received_quantity",
    header: "RECEIVED",
    cell: ({ row }) => (
      <div className="text-left font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
        {row.original.received_quantity ?? 0}
      </div>
    ),
  },

  {
    id: "remaining_quantity",
    header: "REMAINING",
    cell: ({ row }) => {
      const remaining = row.original.quantity - (row.original.received_quantity ?? 0);
      return (
        <div className="text-left font-mono font-bold text-slate-500 dark:text-slate-400 text-xs">
          {remaining}
        </div>
      );
    },
  },

  {
    accessorKey: "unit_cost",
    header: "COST PRICE",
    cell: ({ row }) => (
      <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
        {formatNaira(row.original.unit_cost)}
      </span>
    ),
  },

  {
    accessorKey: "total_cost",
    header: "TOTAL",
    cell: ({ row }) => (
      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs text-right block">
        {formatNaira(row.original.total_cost)}
      </span>
    ),
  },
];
