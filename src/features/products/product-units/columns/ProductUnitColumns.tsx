import type { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import Button from "../../../../components/ui/Button";
import type { ProductUnit } from "../types/productUnit";
import type { Unit } from "../../../units/types/unit";

interface ProductUnitColumnsProps {
  generalUnits: Unit[];
  formatCurrency: (value: number) => string;
  onEdit: (unit: ProductUnit) => void;
  onDelete: (id: string) => void;
}

export const getProductUnitColumns = ({
  generalUnits,
  formatCurrency,
  onEdit,
  onDelete,
}: ProductUnitColumnsProps): ColumnDef<ProductUnit>[] => [
  {
    accessorKey: "unit_id",
    header: "Unit",
    cell: ({ row }) => {
      const unit = generalUnits.find((u) => u.id === row.original.unit_id);

      return (
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            {unit?.name ?? "Unknown"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{unit?.symbol ?? "--"}</p>
        </div>
      );
    },
  },

  {
    accessorKey: "conversion_factor",
    header: "Conversion",
    cell: ({ row }) => (
      <span className="font-mono text-slate-700 dark:text-slate-200">{row.original.conversion_factor}</span>
    ),
  },

  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <div>
        <p className="font-mono text-xs text-slate-800 dark:text-slate-200">{row.original.sku}</p>
        {row.original.barcode && (
          <p className="text-xs text-slate-400 dark:text-slate-500">{row.original.barcode}</p>
        )}
      </div>
    ),
  },

  {
    accessorKey: "cost_price",
    header: "Cost",
    cell: ({ row }) => (
      <span className="font-mono text-slate-600 dark:text-slate-300 font-medium">
        {formatCurrency(row.original.cost_price)}
      </span>
    ),
  },

  {
    accessorKey: "selling_price",
    header: "Selling",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
        {formatCurrency(row.original.selling_price)}
      </span>
    ),
  },

  {
    id: "margin",
    header: "Margin",
    cell: ({ row }) => {
      const profit = row.original.selling_price - row.original.cost_price;
      const margin =
        row.original.selling_price > 0
          ? (profit / row.original.selling_price) * 100
          : 0;

      return (
        <span
          className={
            margin >= 30
              ? "font-semibold text-green-600"
              : "font-semibold text-orange-500"
          }
        >
          {margin.toFixed(1)}%
        </span>
      );
    },
  },

  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
          row.original.is_active
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-600"
        }`}
      >
        {row.original.is_active ? "Active" : "Inactive"}
      </span>
    ),
  },

  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => onEdit(row.original)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          onClick={() => onDelete(row.original.id)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    ),
  },
];
