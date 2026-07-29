import { Scale, Plus } from "lucide-react";
import Button from "../../../../components/ui/Button";

interface ProductInitEmptyStateProps {
  onAddClick: () => void;
}

export const ProductInitEmptyState = ({ onAddClick }: ProductInitEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm min-h-62.5 animate-in fade-in duration-200">
      <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4 ring-8 ring-slate-50/50 dark:ring-slate-800/50">
        <Scale className="h-8 w-8 text-blue-500 dark:text-blue-400" />
      </div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Selling Units Configured</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-5">
        Selling units allow you to sell this product in different packaging configurations (e.g., Cartons, Crates, or Packs) with automated conversion factors and pricing.
      </p>
      <Button
        id="empty-add-selling-unit-btn"
        type="button"
        size="sm"
        onClick={onAddClick}
        className="flex items-center gap-1.5 font-semibold"
      >
        <Plus size={15} />
        <span>Configure First Selling Unit</span>
      </Button>
    </div>
  );
};

export default ProductInitEmptyState;
