import { RefreshCw, TrendingUp, Landmark, Tag } from "lucide-react";
import type { Product } from "../../types/product";
import type { Unit } from "../../../units/types/unit";

interface ProductUnitPreviewProps {
  product: Product;
  generalUnits: Unit[];
  selectedUnitName: string;
  selectedUnitSymbol: string;
  watchedConversion: number;
  watchedSellingPrice: number;
  watchedCostPrice: number;
  formatCurrency: (value: number) => string;
}

export const ProductUnitPreview = ({
  product,
  generalUnits,
  selectedUnitName,
  selectedUnitSymbol,
  watchedConversion: rawConversion,
  watchedSellingPrice,
  watchedCostPrice,
  formatCurrency,
}: ProductUnitPreviewProps) => {
  const watchedConversion = Number(rawConversion) || 1;

  // Find base unit
  const baseUnit = generalUnits.find((u) => u.id === product.base_unit_id);
  const baseUnitSymbol = baseUnit?.symbol || "pcs";
  const baseUnitName = baseUnit?.name || "Piece";

  // Calculations
  const profit = watchedSellingPrice - watchedCostPrice;
  const marginPercentage =
    watchedSellingPrice > 0 ? (profit / watchedSellingPrice) * 100 : 0;
  const baseCost =
    watchedConversion > 0 ? watchedCostPrice / watchedConversion : 0;
  const baseSelling =
    watchedConversion > 0 ? watchedSellingPrice / watchedConversion : 0;

  return (
    <div
      id="pricing-summary-card"
      className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
        <h5 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <RefreshCw size={12} className="text-blue-500 animate-spin-slow" />
          Pricing Summary
        </h5>
        <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">
          Live calculations
        </span>
      </div>

      {/* Grid: Conversion details on left, Stats on right */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Left column: Relation */}
        <div className="md:col-span-1 flex flex-col justify-center space-y-2 text-xs border-r border-slate-200/60 dark:border-slate-700/60 pr-4 md:h-full">
          <div>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
              Base Unit
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {baseUnitName} ({baseUnitSymbol})
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
              Selling Unit
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {selectedUnitName} ({selectedUnitSymbol})
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
              Conversion
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
              1 {selectedUnitSymbol} = {watchedConversion} {baseUnitSymbol}
            </span>
          </div>
        </div>

        {/* Right columns: The 4 Grid Cards */}
        <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Profit Card */}
          <div className="p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/30 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                Profit
              </span>
              <TrendingUp size={12} className="text-emerald-500" />
            </div>
            <span className="block font-extrabold text-emerald-700 dark:text-emerald-400 font-mono text-xs sm:text-sm mt-1">
              {formatCurrency(profit)}
            </span>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400/90 font-medium block mt-0.5">
              Per {selectedUnitSymbol}
            </span>
          </div>

          {/* Margin Card */}
          <div className="p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/30 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                Margin
              </span>
              <span className="text-emerald-500 font-bold text-[10px]">%</span>
            </div>
            <span className="block font-extrabold text-emerald-700 dark:text-emerald-400 font-mono text-xs sm:text-sm mt-1">
              {marginPercentage.toFixed(2)}%
            </span>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400/90 font-medium block mt-0.5">
              Per {selectedUnitSymbol}
            </span>
          </div>

          {/* Base Cost Card */}
          <div className="p-3 rounded-lg border border-blue-100 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/30 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                Base Cost
              </span>
              <Landmark size={12} className="text-blue-500" />
            </div>
            <span className="block font-extrabold text-blue-700 dark:text-blue-400 font-mono text-xs sm:text-sm mt-1">
              {formatCurrency(baseCost)}
            </span>
            <span className="text-[9px] text-blue-600 dark:text-blue-400/90 font-medium block mt-0.5">
              Per {baseUnitSymbol}
            </span>
          </div>

          {/* Base Selling Card */}
          <div className="p-3 rounded-lg border border-blue-100 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/30 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                Base Selling
              </span>
              <Tag size={12} className="text-blue-500" />
            </div>
            <span className="block font-extrabold text-blue-700 dark:text-blue-400 font-mono text-xs sm:text-sm mt-1">
              {formatCurrency(baseSelling)}
            </span>
            <span className="text-[9px] text-blue-600 dark:text-blue-400/90 font-medium block mt-0.5">
              Per {baseUnitSymbol}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
