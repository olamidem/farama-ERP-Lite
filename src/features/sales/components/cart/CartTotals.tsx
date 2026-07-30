import { Tag, Percent } from "lucide-react";
import { formatCurrency } from "../../utils/pricing";

interface CartTotalsProps {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  payableAmount: number;
  taxRate: number;
  onOpenDiscountModal?: () => void;
}

export const CartTotals = ({
  subtotal,
  discountAmount,
  taxAmount,
  payableAmount,
  taxRate,
  onOpenDiscountModal,
}: CartTotalsProps) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
        <span>Subtotal</span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {formatCurrency(subtotal)}
        </span>
      </div>

      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
        <button
          type="button"
          onClick={onOpenDiscountModal}
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline"
        >
          <Tag className="w-3 h-3" />
          Discount
        </button>
        <span className="font-semibold text-rose-600 dark:text-rose-400">
          -{formatCurrency(discountAmount)}
        </span>
      </div>

      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Percent className="w-3 h-3" />
          Tax ({taxRate}%)
        </span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          +{formatCurrency(taxAmount)}
        </span>
      </div>

      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm font-bold">
        <span className="text-slate-900 dark:text-white">Payable Total</span>
        <span className="text-lg text-blue-600 dark:text-blue-400 font-extrabold">
          {formatCurrency(payableAmount)}
        </span>
      </div>
    </div>
  );
};

export default CartTotals;
