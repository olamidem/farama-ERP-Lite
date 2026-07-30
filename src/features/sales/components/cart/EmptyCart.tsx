import { ShoppingCart } from "lucide-react";

export const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 mb-2">
        <ShoppingCart className="w-6 h-6" />
      </div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        Your Cart is Empty
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[200px] mt-1">
        Click on any product from the catalog grid on the left to add items to your basket.
      </p>
    </div>
  );
};

export default EmptyCart;
