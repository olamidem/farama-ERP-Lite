import { Plus } from "lucide-react";
import type { POSProduct, POSProductUnit } from "../../types/sale";
import { formatCurrency } from "../../utils/pricing";

interface ProductCardProps {
  product: POSProduct;
  selectedUnitId?: string;
  onSelectUnit: (unitId: string) => void;
  onAddToCart: (product: POSProduct, unitId?: string) => void;
}

export const ProductCard = ({
  product,
  selectedUnitId,
  onSelectUnit,
  onAddToCart,
}: ProductCardProps) => {
  const units = product.units || [];
  const activeUnit =
    units.find((u: POSProductUnit) => u.id === selectedUnitId) ||
    units.find((u: POSProductUnit) => u.is_default) ||
    units[0];

  const activePrice = Number(activeUnit?.selling_price ?? product.selling_price ?? 0);
  const isOutOfStock = (product.stock || 0) <= 0;

  return (
    <div
      onClick={() => {
        if (!isOutOfStock) onAddToCart(product, activeUnit?.id);
      }}
      className={`group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4 transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600/50 flex flex-col justify-between cursor-pointer ${
        isOutOfStock ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${
              isOutOfStock
                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                : (product.stock || 0) <= 10
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
            }`}
          >
            {isOutOfStock ? "Out of Stock" : `${product.stock} in stock`}
          </span>
        </div>

        {product.sku && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mb-2">
            SKU: {product.sku}
          </p>
        )}
      </div>

      <div className="space-y-3 pt-2">
        {/* Unit Selector if multiple units exist */}
        {units.length > 1 && (
          <div onClick={(e) => e.stopPropagation()}>
            <select
              value={activeUnit?.id || ""}
              onChange={(e) => onSelectUnit(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {units.map((u: POSProductUnit) => (
                <option key={u.id} value={u.id}>
                  {u.unit?.symbol || u.unit?.name || "Unit"} - {formatCurrency(u.selling_price)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/50">
          <div>
            <span className="text-xs text-slate-400 block font-normal">Price</span>
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {formatCurrency(activePrice)}
            </span>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) onAddToCart(product, activeUnit?.id);
            }}
            className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-xs disabled:opacity-50"
            title="Add to Cart"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
