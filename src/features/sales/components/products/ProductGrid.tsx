import { Package, Loader2 } from "lucide-react";
import type { POSProduct } from "../../types/sale";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: POSProduct[];
  isLoading?: boolean;
  selectedUnitIds: Record<string, string>;
  onSelectUnit: (productId: string, unitId: string) => void;
  onAddToCart: (product: POSProduct, unitId?: string) => void;
}

export const ProductGrid = ({
  products,
  isLoading,
  selectedUnitIds,
  onSelectUnit,
  onAddToCart,
}: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400 py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p className="text-sm">Loading available catalog products...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-900/20">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 mb-3">
          <Package className="w-8 h-8" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          No Products Found
        </h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mt-1">
          Try adjusting your search query or selected category to see matching stock.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          selectedUnitId={selectedUnitIds[product.id]}
          onSelectUnit={(unitId) => onSelectUnit(product.id, unitId)}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
