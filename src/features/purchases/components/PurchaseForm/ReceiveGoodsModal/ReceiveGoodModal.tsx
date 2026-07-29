import { useState } from "react";
import type { Purchase } from "../../../types/purchase";
import type { PurchaseItem } from "../../../types/purchaseItem";
import { toast } from "sonner";
import RecievGoodHeader from "./RecievGoodHeader";
import ReceiveGoodsWarning from "./ReceiveGoodsWarning";
import ReceiveGoodsItem from "./ReceiveGoodsItem";
import { useReceivePurchase } from "../../../hook/usePurchasesMutations";

interface ReceiveGoodModalProps {
  purchase: Purchase;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiveGoodModal = ({
  purchase,
  isOpen,
  onClose,
}: ReceiveGoodModalProps) => {
  const receiveMutation = useReceivePurchase();

  const [prevPurchaseId, setPrevPurchaseId] = useState(purchase.id);
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    purchase.items?.forEach((item: PurchaseItem) => {
      const remaining = item.quantity - (item.received_quantity || 0);
      initial[item.id] = Math.max(0, remaining);
    });
    return initial;
  });

  if (purchase.id !== prevPurchaseId) {
    setPrevPurchaseId(purchase.id);
    const initial: Record<string, number> = {};
    purchase.items?.forEach((item: PurchaseItem) => {
      const remaining = item.quantity - (item.received_quantity || 0);
      initial[item.id] = Math.max(0, remaining);
    });
    setQuantities(initial);
  }

  if (!isOpen) return null;

  const handleQtyChange = (itemId: string, val: number, maxAllowed: number) => {
    const cleanVal = Math.max(0, Math.min(val, maxAllowed));
    setQuantities((prev) => ({
      ...prev,
      [itemId]: cleanVal,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasAnyQty = Object.values(quantities).some((q) => q > 0);
    if (!hasAnyQty) {
      toast.error("Please enter a quantity greater than 0 for at least one item.");
      return;
    }

    try {
      const receivedItems = Object.entries(quantities)
        .filter((entry) => entry[1] > 0)
        .map(([purchase_item_id, received_quantity]) => ({
          purchase_item_id,
          received_quantity,
        }));

      await receiveMutation.mutateAsync({
        purchaseId: purchase.id,
        receivedItems,
      });
      onClose();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to log received goods.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        <RecievGoodHeader
          purchaseNumber={purchase.purchase_number}
          onClose={onClose}
        />

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <ReceiveGoodsWarning />

          <div className="space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Items to Receive
            </span>

            {purchase.items?.map((item: PurchaseItem) => {
              const prevRec = item.received_quantity || 0;
              const remaining = item.quantity - prevRec;
              const currentVal = quantities[item.id] ?? 0;

              return (
                <ReceiveGoodsItem
                  key={item.id}
                  item={item}
                  quantity={currentVal}
                  remaining={remaining}
                  onChange={(val) => handleQtyChange(item.id, val, remaining)}
                />
              );
            })}
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition shadow-3xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={receiveMutation.isPending}
              className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed text-white font-extrabold rounded-xl cursor-pointer transition shadow-sm hover:shadow-indigo-500/10"
            >
              {receiveMutation.isPending ? "Updating Stock..." : "Confirm Receipt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceiveGoodModal;
