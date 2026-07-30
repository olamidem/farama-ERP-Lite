import { useState } from "react";
import { X, Tag, Percent, DollarSign } from "lucide-react";
import { useCartStore } from "../../store/cart.store";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
}

export const DiscountModal = ({
  isOpen,
  onClose,
  subtotal,
}: DiscountModalProps) => {
  const { discountVal, discountType, setDiscount } = useCartStore();
  const [val, setVal] = useState<number>(discountVal);
  const [type, setType] = useState<"percentage" | "fixed">(discountType);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setDiscount(val, type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Tag className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              Apply Order Discount
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-4">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType("percentage")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === "percentage"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500"
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              Percentage (%)
            </button>

            <button
              type="button"
              onClick={() => setType("fixed")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === "fixed"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Fixed Amount (₦)
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Discount Value
            </label>
            <input
              type="number"
              min="0"
              max={type === "percentage" ? 100 : subtotal}
              step="any"
              value={val}
              onChange={(e) => setVal(Number(e.target.value))}
              placeholder="0"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setVal(0);
                setDiscount(0, "percentage");
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Reset
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
            >
              Apply Discount
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountModal;
