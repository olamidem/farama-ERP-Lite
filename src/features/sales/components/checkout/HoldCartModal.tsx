import { useState } from "react";
import { X, Bookmark, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/pricing";

interface HoldCartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HoldCartModal = ({ isOpen, onClose }: HoldCartModalProps) => {
  const {
    items,
    heldCarts,
    holdCart,
    isHoldingCart,
    loadHeldCart,
    deleteHeldCart,
    remarks,
  } = useCart();

  const [holdNote, setHoldNote] = useState(remarks);

  if (!isOpen) return null;

  const handleHoldCurrentCart = async () => {
    if (items.length === 0) return;
    await holdCart(holdNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Bookmark className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              Hold & Retrieve Carts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hold Active Cart Form */}
        {items.length > 0 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-2">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">
              Hold Current Active Cart ({items.length} items)
            </h4>
            <input
              type="text"
              value={holdNote}
              onChange={(e) => setHoldNote(e.target.value)}
              placeholder="Add hold reference / customer note..."
              className="w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
            />
            <button
              type="button"
              disabled={isHoldingCart}
              onClick={handleHoldCurrentCart}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all"
            >
              {isHoldingCart ? "Holding Cart..." : "Hold Active Cart"}
            </button>
          </div>
        )}

        {/* List of Previously Held Carts */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Previously Held Carts ({heldCarts.length})
          </h4>

          {heldCarts.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No held carts found in session.
            </p>
          ) : (
            heldCarts.map((cart) => (
              <div
                key={cart.id}
                className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {cart.cart_number || cart.id}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {cart.items?.length || 0} items
                    </span>
                  </div>
                  {cart.notes && (
                    <p className="text-xs text-slate-500 line-clamp-1">{cart.notes}</p>
                  )}
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    {formatCurrency(cart.total_amount)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      loadHeldCart(cart);
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1"
                    title="Restore Cart"
                  >
                    Restore
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => cart.id && deleteHeldCart(cart.id)}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Held Cart"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HoldCartModal;
