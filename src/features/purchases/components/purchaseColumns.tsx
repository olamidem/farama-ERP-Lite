import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Edit, Trash2 } from "lucide-react";
import type { Purchase } from "../types/purchase";
import { getStatusBadgeStyle, formatStatusText } from "../utils/purchaseStatus";

interface ColumnOptions {
  onView: (purchase: Purchase) => void;
  onEdit: (purchase: Purchase) => void;
  onDelete: (id: string) => void;
}

export const createPurchaseColumns = ({
  onView,
  onEdit,
  onDelete,
}: ColumnOptions & { isCompact?: boolean }): ColumnDef<Purchase>[] => {
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return [
    {
      accessorKey: "purchase_number",
      header: "PO NUMBER",
      cell: ({ row }) => {
        const purchase = row.original;
        return (
          <button
            onClick={() => onView(purchase)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer bg-transparent border-0 p-0 text-left transition"
            id={`btn-view-${purchase.id}`}
          >
            {purchase.purchase_number}
          </button>
        );
      },
    },
    {
      accessorKey: "supplier.name",
      header: "SUPPLIER",
      cell: ({ row }) => {
        return (
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {row.original.supplier?.name || "Unknown Supplier"}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase border ${getStatusBadgeStyle(
              status
            )}`}
          >
            {formatStatusText(status)}
          </span>
        );
      },
    },
    {
      accessorKey: "total_amount",
      header: "TOTAL",
      cell: ({ row }) => {
        return (
          <span className="font-sans text-xs font-extrabold text-slate-800 dark:text-slate-200">
            {formatNaira(row.original.total_amount)}
          </span>
        );
      },
    },
    {
      accessorKey: "purchase_date",
      header: "DATE",
      cell: ({ row }) => {
        return (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {formatDate(row.original.purchase_date)}
          </span>
        );
      },
    },
    {
      accessorKey: "received_percentage",
      header: "RECEIVED",
      cell: ({ row }) => {
        const pct = row.original.received_percentage || 0;
        let barColor = "bg-slate-200 dark:bg-slate-700";
        if (pct === 100) {
          barColor = "bg-emerald-500";
        } else if (pct > 0) {
          barColor = "bg-blue-600 dark:bg-blue-500";
        }

        return (
          <div className="flex items-center gap-2.5 max-w-28" id={`pct-col-${row.original.id}`}>
            <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 min-w-8">
              {pct}%
            </span>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "ACTIONS",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-1" id={`actions-col-${p.id}`}>
            <button
              onClick={() => onView(p)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition"
              title="View Details"
              id={`btn-eye-${p.id}`}
            >
              <Eye size={14} />
            </button>
            <button
              onClick={() => onEdit(p)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition"
              title="Edit PO"
              id={`btn-edit-${p.id}`}
            >
              <Edit size={14} />
            </button>
            {p.status === "PENDING" && (
              <button
                onClick={() => onDelete(p.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition"
                title="Delete PO"
                id={`btn-delete-${p.id}`}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        );
      },
    },
  ];
};
