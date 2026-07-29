import type { PurchaseItem } from "../../../types/purchaseItem";

interface ReceiveGoodsItemProps {
  item: PurchaseItem;
  quantity: number;
  remaining: number;
  onChange: (value: number) => void;
}

export const ReceiveGoodsItem = ({
  item,
  quantity,
  remaining,
  onChange,
}: ReceiveGoodsItemProps) => {
  const prevRec = item.received_quantity || 0;
  const unitDisplay =
    (item.product_unit as unknown as { unit?: { name: string } })?.unit?.name ||
    "pcs";

  return (
    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between gap-4 transition-colors">
      <div className="min-w-0">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">
          {item.product?.name || "Product"}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">
          Ordered: {item.quantity} {unitDisplay} | Previously Received:{" "}
          {prevRec}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
          Receive Qty:
        </span>
        <input
          type="number"
          min={0}
          max={remaining}
          value={quantity}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="w-20 px-2.5 py-1.5 text-xs text-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500"
        />
      </div>
    </div>
  );
};

export default ReceiveGoodsItem;
