import type { ColumnDef } from "@tanstack/react-table";
import Badge from "../../../components/ui/Badge";
import type { Category } from "../../categories/types/category";
import type { Product } from "../types/product";
import { selectionColumn } from "../../../components/ui/DataTable/SelectionColumn";
import SortableHeader from "../../../components/ui/DataTable/SortableHeader";
import { ProductAvatar } from "./ProductAvatar";
import { Eye, Pencil, Archive, RotateCcw } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { formatCurrency } from "../../../utils/formatCurrenty";

interface ProductColumnsProps {
  categories: Category[];
  onEdit: (product: Product) => void;
  onDeactivate: (product: Product) => void;
  onRestore: (product: Product) => void;
  sortBy: "created_at" | "name" | "selling_price" | "stock";
  ascending: boolean;
  onSort: (column: "created_at" | "name" | "selling_price" | "stock") => void;
}

export const productColumns = ({
  categories,
  onEdit,
  onDeactivate,
  onRestore,
  sortBy,
  ascending,
  onSort,
}: ProductColumnsProps): ColumnDef<Product>[] => [
  selectionColumn<Product>(),
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <span className="rounded-md font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 px-1.5 py-0.5">
        {row.original.sku}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: () => (
      <SortableHeader
        label="Product"
        column="name"
        currentSort={sortBy}
        ascending={ascending}
        onSort={onSort}
      />
    ),
    cell: ({ row }) => {
      const product = row.original;
      const category = categories.find((c) => c.id === product.category_id);
      return (
        <div className="flex items-center gap-3">
          <ProductAvatar name={product.name} />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
              {product.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {product.description || category?.name || "No description"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category_id",
    header: "Category",
    cell: ({ row }) => {
      const category = categories.find(
        (c) => c.id === row.original.category_id,
      );
      return (
        <Badge
          variant="info"
          size="sm"
          className="text-slate-800 dark:text-slate-200 rounded text-[11px]"
        >
          {category?.name ?? "Uncategorized"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "selling_price",
    header: () => (
      <SortableHeader
        label="Selling Price"
        column="selling_price"
        currentSort={sortBy}
        ascending={ascending}
        onSort={onSort}
      />
    ),
    cell: ({ row }) => (
      <span className="font-bold text-slate-900 dark:text-slate-100">
        {formatCurrency(row.original.selling_price)}
      </span>
    ),
  },
  {
    accessorKey: "cost_price",
    header: "Cost Price",
    cell: ({ row }) => (
      <span className="text-slate-500 dark:text-slate-400 font-medium">
        {formatCurrency(row.original.cost_price)}
      </span>
    ),
  },
  {
    accessorKey: "stock",
    header: () => (
      <SortableHeader
        label="Stock"
        column="stock"
        currentSort={sortBy}
        ascending={ascending}
        onSort={onSort}
      />
    ),
    cell: ({ row }) => {
      const stock = row.original.stock;
      const isLowStock = stock <= row.original.min_stock_alert;
      const isOutOfStock = stock === 0;

      let textColor = "text-emerald-600 font-medium";
      if (isOutOfStock) {
        textColor = "text-rose-600 font-medium";
      } else if (isLowStock) {
        textColor = "text-amber-600 font-medium";
      }

      return (
        <span className={textColor}>
          {stock} {stock === 1 ? "unit" : "units"}
        </span>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const product = row.original;
      if (!product.is_active) {
        return <Badge variant="default">Inactive</Badge>;
      }
      if (product.stock === 0) {
        return <Badge variant="danger">Out of Stock</Badge>;
      }
      if (product.stock <= product.min_stock_alert) {
        return <Badge variant="warning">Low Stock</Badge>;
      }
      return <Badge variant="success">Active</Badge>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const product = row.original;

      if (product.is_active) {
        return (
          <div className="flex items-center gap-1.5">
            <Link
              to="/products/$productId"
              params={{ productId: String(product.id) }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition duration-150"
              title="View details"
            >
              <Eye size={15} />
            </Link>
            <button
              onClick={() => onEdit(product)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition duration-150 cursor-pointer"
              title="Edit Product"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDeactivate(product)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-rose-200 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 transition duration-150 cursor-pointer"
              title="Deactivate Product"
            >
              <Archive size={14} />
            </button>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onRestore(product)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition duration-150 cursor-pointer"
            title="Restore Product"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      );
    },
  },
];
