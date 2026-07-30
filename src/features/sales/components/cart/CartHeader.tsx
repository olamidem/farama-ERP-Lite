import { ShoppingCart, Trash2, Bookmark } from "lucide-react";

interface CartHeaderProps {
  itemCount: number;
  onClearCart: () => void;
  onOpenHeldCarts?: () => void;
  heldCount?: number;
}

export const CartHeader = ({
  itemCount,
  onClearCart,
  onOpenHeldCarts,
  heldCount = 0,
}: CartHeaderProps) => {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600 dark:text-blue-400">
          <ShoppingCart className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            Current Order
          </h3>
          <p className="text-xs text-slate-400">
            {itemCount} {itemCount === 1 ? "item" : "items"} selected
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {onOpenHeldCarts && (
          <button
            type="button"
            onClick={onOpenHeldCarts}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors relative"
            title="View Held Orders"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Held</span>
            {heldCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {heldCount}
              </span>
            )}
          </button>
        )}

        {itemCount > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors"
            title="Clear entire cart"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default CartHeader;
