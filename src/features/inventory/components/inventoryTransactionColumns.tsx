import type { ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import type { InventoryTransactionWithRelations } from "../types/inventoryTransaction";
import { formatDate } from "../../../utils/formatDate";

interface InventoryTransactionColumnsProps {
  onViewDetails: (tx: InventoryTransactionWithRelations) => void;
}

export const getInventoryTransactionColumns = ({
  onViewDetails,
}: InventoryTransactionColumnsProps): ColumnDef<InventoryTransactionWithRelations>[] => [
  {
    accessorKey: "created_at",
    header: "DATE",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return (
        <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs">
          {formatDate(date.toLocaleDateString())}
        </span>
      );
    },
  },
  {
    accessorKey: "product",
    header: "PRODUCT",
    cell: ({ row }) => {
      const product = row.original.product;
      const name = product?.name ?? "Unknown Product";
      return (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-100/30 dark:border-indigo-900/50 flex items-center justify-center font-bold text-[12px] text-indigo-900 dark:text-indigo-300 uppercase shrink-0">
            {name.slice(0, 2)}
          </div>
          <div>
            <p
              className="font-extrabold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-37.5"
              title={name}
            >
              {name}
            </p>
            <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mt-0.5">
              SKU: {product?.sku ?? "N/A"}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "product_unit",
    header: "UNIT",
    cell: ({ row }) => {
      const pu = row.original.product_unit;
      if (!pu) return <span className="text-slate-400 dark:text-slate-500 text-xs">--</span>;
      const unitName = pu.unit?.name || "Piece";
      const unitSymbol = pu.unit?.symbol || "pcs";
      return (
        <span className="text-slate-600 dark:text-slate-300 font-semibold text-xs">
          {unitName} ({unitSymbol})
        </span>
      );
    },
  },
  {
    accessorKey: "transaction_type",
    header: "TYPE",
    cell: ({ row }) => {
      const type = row.original.transaction_type;
      let badgeClass = "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300";
      if (type === "PURCHASE") {
        badgeClass = "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300";
      } else if (type === "SALE") {
        badgeClass = "bg-rose-50 dark:bg-rose-950/50 border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-300";
      } else if (type === "ADJUSTMENT") {
        badgeClass = "bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/50 text-amber-700 dark:text-amber-300";
      } else if (type === "DAMAGE") {
        badgeClass = "bg-red-50 dark:bg-red-950/50 border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-300";
      } else if (type === "RETURN") {
        badgeClass = "bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-300";
      } else if (type === "TRANSFER") {
        badgeClass = "bg-violet-50 dark:bg-violet-950/50 border-violet-100 dark:border-violet-900/50 text-violet-700 dark:text-violet-300";
      } else if (type === "OPENING STOCK") {
        badgeClass = "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300";
      }

      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-extrabold border uppercase ${badgeClass}`}
        >
          {type}
        </span>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "QTY",
    cell: ({ row }) => {
      const qty = row.original.quantity;
      const isPositive = qty > 0;
      const sign = isPositive ? "+" : "";
      const textClass = isPositive
        ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
        : "text-rose-600 dark:text-rose-400 font-extrabold";
      return (
        <span className={`font-mono text-xs ${textClass}`}>
          {sign}
          {qty}
        </span>
      );
    },
  },
  {
    accessorKey: "balance_after",
    header: "BALANCE",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
        {row.original.balance_after}
      </span>
    ),
  },
  {
    accessorKey: "reference",
    header: "REFERENCE",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
        {row.original.reference}
      </span>
    ),
  },
  {
    accessorKey: "profiles",
    header: "USER",
    cell: ({ row }) => {
      const name =
        row.original.profiles?.raw_user_meta_data?.name || "Admin User";
      return (
        <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs">{name}</span>
      );
    },
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onViewDetails(row.original)}
          className="px-2.5 py-1 text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 rounded-md transition cursor-pointer"
        >
          View
        </button>
        <button className="p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
          <MoreVertical size={14} />
        </button>
      </div>
    ),
  },
];