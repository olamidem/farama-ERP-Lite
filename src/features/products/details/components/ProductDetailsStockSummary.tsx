import type { Product } from "../../types/product";

interface ProductDetailsStockSummaryProps {
  product: Product;
}

export const ProductDetailsStockSummary = ({
  product,
}: ProductDetailsStockSummaryProps) => {
  const stock = product.stock || 0;
  const reservedStock = 0;
  const availableStock = stock - reservedStock;
  const minStockAlert = product.min_stock_alert || 10;
  const isLowStock = stock <= minStockAlert;

  return (
    <div className="relative overflow-hidden p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full">
      {/* Background Graphic Box (isometric cube sketch) */}
      <div className="absolute right-4 bottom-4 w-32 h-32 opacity-15 pointer-events-none text-slate-400 dark:text-slate-600">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full fill-none stroke-current stroke-[1.5]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Face */}
          <polygon points="50,15 80,30 50,45 20,30" />
          {/* Left Face */}
          <polygon points="20,30 50,45 50,80 20,65" />
          {/* Right Face */}
          <polygon points="50,45 80,30 80,65 50,80" />
          {/* Inner details for perspective box look */}
          <line x1="50" y1="45" x2="50" y2="80" />
          <line x1="20" y1="30" x2="50" y2="45" />
          <line x1="50" y1="45" x2="80" y2="30" />
        </svg>
      </div>

      <div className="relative z-10 space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
          Stock Summary
        </h3>

        <div className="space-y-3 pt-2">
          {/* Current Stock */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Current Stock
            </span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {stock} units
            </span>
          </div>

          {/* Reserved Stock */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Reserved Stock
            </span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono">
              {reservedStock} units
            </span>
          </div>

          {/* Available Stock */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Available Stock
            </span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {availableStock} units
            </span>
          </div>

          {/* Min Stock Alert */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Min. Stock Alert
            </span>
            <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              {minStockAlert} units
            </span>
          </div>
        </div>

        {isLowStock && (
          <div className="mt-4 p-2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-bold text-center animate-pulse">
            ⚠️ Low Stock Alert: Reorder immediately!
          </div>
        )}
      </div>
    </div>
  );
};
