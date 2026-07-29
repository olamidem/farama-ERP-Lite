import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, Sparkles, Barcode } from "lucide-react";
import type { Product } from "../../types/product";
import type { Unit } from "../../../units/types/unit";
import type { ProductUnit } from "../types/productUnit";
import {
  createProductUnitSchema,
  type ProductUnitFormData,
} from "../validation/productUnit.schema";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Label from "../../../../components/ui/Label";
import Select from "../../../../components/ui/Select";
import { ProductUnitPreview } from "./ProductUnitPreview";
import { generateBarcode } from "../../utils/generateBarcode";

interface ProductUnitsFormProps {
  product: Product;
  generalUnits: Unit[];
  editingUnit: ProductUnit | null;
  onSubmit: (data: ProductUnitFormData) => Promise<void>;
  onCancel: () => void;
  isPending: boolean;
  formatCurrency: (value: number) => string;
}

export const ProductUnitsForm = ({
  product,
  generalUnits,
  editingUnit,
  onSubmit,
  onCancel,
  isPending,
  formatCurrency,
}: ProductUnitsFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductUnitFormData>({
    resolver: zodResolver(createProductUnitSchema),
    defaultValues: {
      unit_id: "",
      conversion_factor: 1,
      selling_price: 0,
      cost_price: 0,
      sku: "",
      barcode: "",
    },
  });

  const watchedUnitId = watch("unit_id");
  const watchedConversion = watch("conversion_factor") || 1;
  const watchedSellingPrice = watch("selling_price") || 0;
  const watchedCostPrice = watch("cost_price") || 0;

  // Selected unit details
  const selectedUnit = useMemo(() => {
    return generalUnits.find((u) => u.id === watchedUnitId);
  }, [generalUnits, watchedUnitId]);

  // Suggest pricing & SKU
  const handleAutoSuggest = () => {
    const factor = Number(watchedConversion) || 1;
    const suggestedCost = product.cost_price * factor;
    const suggestedSelling = product.selling_price * factor;

    setValue("cost_price", suggestedCost);
    setValue("selling_price", suggestedSelling);

    if (selectedUnit) {
      const suggestedSku = `${product.sku}-${selectedUnit.symbol.toUpperCase()}`;
      setValue("sku", suggestedSku);
    }
  };

  useEffect(() => {
    if (editingUnit) {
      reset({
        unit_id: editingUnit.unit_id,
        conversion_factor: editingUnit.conversion_factor,
        selling_price: editingUnit.selling_price,
        cost_price: editingUnit.cost_price,
        sku: editingUnit.sku,
        barcode: editingUnit.barcode || "",
      });
    } else {
      reset({
        unit_id: "",
        conversion_factor: 1,
        selling_price: 0,
        cost_price: 0,
        sku: "",
        barcode: "",
      });
    }
  }, [editingUnit, product.id, reset]);

  const activeUnits = generalUnits.filter((u) => u.is_active);

  const selectOptions = useMemo(() => {
    return activeUnits.map((u) => ({
      value: u.id,
      label: `${u.name} (${u.symbol})`,
    }));
  }, [activeUnits]);

  return (
    <form
      id="product-unit-form"
      onSubmit={handleSubmit(onSubmit)}
      className="p-5 border border-blue-100 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/20 rounded-2xl space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center justify-between border-b border-blue-50 dark:border-blue-900/30 pb-2.5">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
          {editingUnit ? "Edit Selling Unit" : "New Selling Unit Configuration"}
        </h4>
        <div className="flex items-center gap-1.5">
          <button
            id="auto-suggest-btn"
            type="button"
            onClick={handleAutoSuggest}
            disabled={!watchedUnitId}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/50 disabled:opacity-50 disabled:cursor-not-allowed select-none transition-colors cursor-pointer"
            title="Automatically calculate prices based on conversion factor and base product price"
          >
            <Calculator size={12} />
            <span>Auto-Calculate Pricing & SKU</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Unit Selection */}
        <div className="space-y-1">
          <Label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Selling Unit Of Measure
          </Label>
          <Select
            {...register("unit_id")}
            id="unit_id_select"
            placeholder="Select unit..."
            options={selectOptions}
            className="w-full h-10 px-3 text-sm font-medium text-slate-800 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700"
          />
          {errors.unit_id && (
            <p className="text-xs text-red-500 mt-0.5">
              {errors.unit_id.message}
            </p>
          )}
        </div>

        {/* Conversion Factor */}
        <div className="space-y-1">
          <Label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Conversion Factor
          </Label>
          <div className="relative">
            <Input
              id="conversion_factor_input"
              type="number"
              step="any"
              {...register("conversion_factor", { valueAsNumber: true })}
              placeholder="e.g. 12"
              className="w-full pr-10 font-mono dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-500">
              {selectedUnit ? selectedUnit.symbol : "pcs"}
            </span>
          </div>
          {errors.conversion_factor && (
            <p className="text-xs text-red-500 mt-0.5">
              {errors.conversion_factor.message}
            </p>
          )}
        </div>

        {/* SKU */}
        <div className="space-y-1">
          <Label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Selling Unit SKU
          </Label>
          <Input
            id="sku_input"
            type="text"
            {...register("sku")}
            placeholder="e.g. BEV-COK-CTN"
            className="w-full font-mono uppercase dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
          />
          {errors.sku && (
            <p className="text-xs text-red-500 mt-0.5">{errors.sku.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cost Price */}
        <div className="space-y-1">
          <Label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Cost Price
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500">
              ₦
            </span>
            <Input
              id="cost_price_input"
              type="number"
              step="any"
              {...register("cost_price", { valueAsNumber: true })}
              placeholder="0.00"
              className="w-full pl-7 font-mono dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            />
          </div>
          {errors.cost_price && (
            <p className="text-xs text-red-500 mt-0.5">
              {errors.cost_price.message}
            </p>
          )}
        </div>

        {/* Selling Price */}
        <div className="space-y-1">
          <Label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Selling Price
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500">
              ₦
            </span>
            <Input
              id="selling_price_input"
              type="number"
              step="any"
              {...register("selling_price", { valueAsNumber: true })}
              placeholder="0.00"
              className="w-full pl-7 font-mono dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            />
          </div>
          {errors.selling_price && (
            <p className="text-xs text-red-500 mt-0.5">
              {errors.selling_price.message}
            </p>
          )}
        </div>

        {/* Barcode */}
        <div className="space-y-1">
          <Label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Barcode (Optional)
          </Label>
          <div className="relative">
            <Input
              id="barcode_input"
              type="text"
              {...register("barcode")}
              placeholder="e.g. 615110001"
              className="w-full pr-28 font-mono dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                id="generate-barcode-btn"
                onClick={() => {
                  const generated = generateBarcode();
                  setValue("barcode", generated);
                }}
                className="px-2 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded border border-blue-200 dark:border-blue-800 transition-colors bg-white dark:bg-slate-800 flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-blue-500 animate-pulse" />
                <span>Generate</span>
              </button>
              <Barcode className="h-4 w-4 text-slate-400 dark:text-slate-500 mr-2" />
            </div>
          </div>
          {errors.barcode && (
            <p className="text-xs text-red-500 mt-0.5">
              {errors.barcode.message}
            </p>
          )}
        </div>
      </div>

      {/* Dynamic Factor Calculation Preview */}
      {selectedUnit && (
        <ProductUnitPreview
          product={product}
          generalUnits={generalUnits}
          selectedUnitName={selectedUnit.name}
          selectedUnitSymbol={selectedUnit.symbol}
          watchedConversion={watchedConversion}
          watchedSellingPrice={watchedSellingPrice}
          watchedCostPrice={watchedCostPrice}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Action buttons */}
      <div className="flex justify-end items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
        <button
          id="cancel-unit-form-btn"
          type="button"
          onClick={onCancel}
          className="px-4 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition"
        >
          Cancel
        </button>
        <Button
          id="submit-unit-form-btn"
          type="submit"
          size="sm"
          loading={isPending}
          className="flex items-center gap-1 font-semibold"
        >
          <span>{editingUnit ? "Save Changes" : "Create Selling Unit"}</span>
        </Button>
      </div>
    </form>
  );
};
