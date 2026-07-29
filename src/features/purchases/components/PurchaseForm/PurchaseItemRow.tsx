import { Trash2 } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import Button from "../../../../components/ui/Button";
import { formatCurrency } from "../../../../utils/formatCurrenty";
import type { CatalogProduct } from "../../types/catalogProduct";
import type { CatalogProductUnit } from "../../types/catalogProductUnit";

export interface ItemRowValue {
  product_id: string;
  product_unit_id: string;
  quantity: number;
  cost_price: number;
}

interface PurchaseItemRowProps {
  index: number;
  row: ItemRowValue;
  products: CatalogProduct[];
  productUnits: CatalogProductUnit[];
  onChange: (index: number, updated: Partial<ItemRowValue>) => void;
  onRemove: (index: number) => void;
}

const PurchaseItemRow = ({
  index,
  row,
  products,
  productUnits,
  onChange,
  onRemove,
}: PurchaseItemRowProps) => {
  const availableUnits = productUnits.filter(
    (unit) => unit.product_id === row.product_id,
  );

  const handleProductChange = (productId: string) => {
    const product = products.find((item) => item.id === productId);

    const defaultUnit = productUnits.find(
      (unit) => unit.product_id === productId,
    );

    onChange(index, {
      product_id: productId,
      product_unit_id: defaultUnit?.id ?? "",
      cost_price: product?.cost_price ?? 0,
    });
  };

  const lineTotal = row.quantity * row.cost_price;

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800">
      <td className="py-3 pr-3">
        <Select
          value={row.product_id}
          onChange={(event) => handleProductChange(event.target.value)}
          options={products.map((product) => ({
            value: product.id,
            label: `${product.name}${product.sku ? ` (${product.sku})` : ""}`,
          }))}
          placeholder="Select Product"
        />
      </td>

      <td className="py-3 pr-3">
        <Select
          value={row.product_unit_id}
          disabled={!row.product_id}
          onChange={(event) =>
            onChange(index, {
              product_unit_id: event.target.value,
            })
          }
          options={availableUnits.map((unit) => ({
            value: unit.id,
            label: unit.unit
              ? `${unit.unit.name} (${unit.unit.symbol})`
              : "Unit",
          }))}
          placeholder="Select Unit"
        />
      </td>

      <td className="py-3 pr-3 w-28">
        <Input
          type="number"
          min={1}
          disabled={!row.product_id}
          value={row.quantity}
          onChange={(event) =>
            onChange(index, {
              quantity: Math.max(1, Number(event.target.value) || 1),
            })
          }
          className="text-center font-mono"
        />
      </td>

      <td className="py-3 pr-3 w-40">
        <Input
          type="number"
          min={0}
          disabled={!row.product_id}
          value={row.cost_price}
          onChange={(event) =>
            onChange(index, {
              cost_price: Math.max(0, Number(event.target.value) || 0),
            })
          }
          className="font-mono"
        />
      </td>

      <td className="py-3 pr-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
        {formatCurrency(lineTotal)}
      </td>

      <td className="py-3 text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
        >
          <Trash2 size={14} />
        </Button>
      </td>
    </tr>
  );
};

export default PurchaseItemRow;
