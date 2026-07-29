import { ArrowLeft, Pencil, Barcode, Trash2, ShoppingCart } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface ProductDetailsHeaderProps {
  productId: string;
  onEdit: () => void;
  onArchive: () => void;
  onPrintBarcode: () => void;
}

export const ProductDetailsHeader = ({
  productId,
  onEdit,
  onArchive,
  onPrintBarcode,
}: ProductDetailsHeaderProps) => {
  return (
    <div className="space-y-4">
      {/* Breadcrumb row */}
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        <Link to="/products" className="hover:text-slate-800 dark:hover:text-slate-200 transition">
          Products
        </Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-800 dark:text-slate-100 font-bold">Product Details</span>
      </div>

      {/* Main header actions row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Back button */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-base font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition shadow-xs"
        >
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/purchases"
            search={{ productId } as Record<string, string>}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-transparent bg-emerald-600 hover:bg-emerald-700 text-base font-bold text-white transition shadow-xs"
          >
            <ShoppingCart size={15} />
            <span>Reorder / Purchase</span>
          </Link>

          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition shadow-xs cursor-pointer"
          >
            <Pencil size={15} className="text-slate-500 dark:text-slate-400" />
            <span>Edit Product</span>
          </button>

          <button
            onClick={onPrintBarcode}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition shadow-xs cursor-pointer"
          >
            <Barcode size={15} className="text-slate-500 dark:text-slate-400" />
            <span>Print Barcode Label</span>
          </button>

          <button
            onClick={onArchive}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/10 dark:bg-rose-950/30 text-base font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition shadow-xs cursor-pointer"
          >
            <Trash2 size={15} />
            <span>Archive Product</span>
          </button>
        </div>
      </div>
    </div>
  );
};

