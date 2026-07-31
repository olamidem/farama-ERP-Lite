import { Plus, Minus, Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "../../types/cart";
import { formatCurrency } from "../../utils/pricing";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, unitId: string, delta: number) => void;
  onRemoveItem: (productId: string, unitId: string) => void;
}

export const CartItem = ({
  item,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemProps) => {
  const lineTotal = item.quantity * item.unit_price;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 shadow-2xs space-y-2 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
            {item.name}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {item.unit_name} • {formatCurrency(item.unit_price)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onRemoveItem(item.product_id, item.product_unit_id)}
          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          title="Remove item"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200/60 dark:border-slate-800">
          <button
            type="button"
            onClick={() =>
              onUpdateQuantity(item.product_id, item.product_unit_id, -1)
            }
            className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 shadow-2xs transition-all"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              onUpdateQuantity(item.product_id, item.product_unit_id, 1)
            }
            className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 shadow-2xs transition-all"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <span className="text-sm font-bold text-slate-900 dark:text-white">
          {formatCurrency(lineTotal)}
        </span>
      </div>
    </div>
  );
};

export default CartItem;
