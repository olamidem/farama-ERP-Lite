import { Plus, ShoppingBasket } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Label from "../../../../components/ui/Label";
import PurchaseItemRow, { type ItemRowValue } from "./PurchaseItemRow";
import type { CatalogProduct } from "../../types/catalogProduct";
import type { CatalogProductUnit } from "../../types/catalogProductUnit";
import { formatCurrency } from "../../../../utils/formatCurrenty";

interface PurchaseItemsTableProps {
  items: ItemRowValue[];
  products: CatalogProduct[];
  productUnits: CatalogProductUnit[];
  loading?: boolean;
  onChange: (index: number, updated: Partial<ItemRowValue>) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
}

const PurchaseItemsTable = ({
  items,
  products,
  productUnits,
  loading = false,
  onChange,
  onAddRow,
  onRemoveRow,
}: PurchaseItemsTableProps) => {

  const totalItems = items.length;

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const grandTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.cost_price,
    0,
  );

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors">
      <div className="mb-6 flex items-center gap-2">
        <ShoppingBasket size={18} className="text-indigo-600 dark:text-indigo-400" />

        <Label className="mb-0 text-base font-bold text-slate-800 dark:text-slate-100">
          Purchase Items
        </Label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-175 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="pb-3 pr-3">Product</th>

              <th className="pb-3 pr-3">Unit</th>

              <th className="pb-3 pr-3 text-center">Quantity</th>

              <th className="pb-3 pr-3">Cost Price</th>

              <th className="pb-3 pr-3 text-right">Subtotal</th>

              <th className="w-12 pb-3" />
            </tr>
          </thead>

          <tbody>
            {items.map((row, index) => (
              <PurchaseItemRow
                key={index}
                index={index}
                row={row}
                products={products}
                productUnits={productUnits}
                onChange={onChange}
                onRemove={onRemoveRow}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={onAddRow}
          disabled={loading}
        >
          <Plus size={16} />
          Add Product
        </Button>

        <div className="flex gap-10 text-sm">
          <div className="space-y-1 text-slate-500 dark:text-slate-400">
            <p>Total Items</p>
            <p>Total Quantity</p>
            <p className="pt-2 font-bold uppercase text-slate-700 dark:text-slate-300">
              Grand Total
            </p>
          </div>

          <div className="space-y-1 text-right font-mono">
            <p className="font-semibold text-slate-800 dark:text-slate-200">{totalItems}</p>

            <p className="font-semibold text-slate-800 dark:text-slate-200">{totalQuantity}</p>

            <p className="pt-2 text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(grandTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseItemsTable;
