import { useMemo } from "react";
import { Boxes, Scale, TrendingUp, CheckCircle2 } from "lucide-react";
import type { ProductUnit } from "../types/productUnit";
import type { Product } from "../../types/product";
import type { Unit } from "../../../units/types/unit";

interface ProductUnitsStatsProps {
  productUnits: ProductUnit[];
  product: Product;
  generalUnits: Unit[];
}

export const ProductUnitsStats = ({
  productUnits,
  product,
  generalUnits,
}: ProductUnitsStatsProps) => {
  const baseUnit = useMemo(() => {
    return generalUnits.find((u) => u.id === product.base_unit_id);
  }, [generalUnits, product.base_unit_id]);

  const baseUnitDisplay = baseUnit
    ? `${baseUnit.name} (${baseUnit.symbol})`
    : "Piece (pcs)";

  const stats = useMemo(() => {
    if (productUnits.length === 0) {
      return {
        count: 0,
        avgMargin: 0,
        status: "Active",
      };
    }

    let totalMargin = 0;
    productUnits.forEach((pu) => {
      const profit = pu.selling_price - pu.cost_price;
      const margin =
        pu.selling_price > 0 ? (profit / pu.selling_price) * 100 : 0;
      totalMargin += margin;
    });

    const avgMargin = totalMargin / productUnits.length;

    return {
      count: productUnits.length,
      avgMargin,
      status: "Active",
    };
  }, [productUnits]);

  return (
    <div
      id="product-units-stats-container"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {/* Base Unit Card */}
      <div className="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-3 shadow-sm">
        <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Base Unit
          </p>
          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-none mt-1">
            {baseUnitDisplay}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Primary unit of measure
          </p>
        </div>
      </div>

      {/* Total Variants Card */}
      <div className="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-3 shadow-sm">
        <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
          <Boxes className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Total Variants
          </p>
          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-none mt-1">
            {stats.count}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Selling unit variants
          </p>
        </div>
      </div>

      {/* Average Margin Card */}
      <div className="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-3 shadow-sm">
        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Average Margin
          </p>
          <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 leading-none mt-1">
            {stats.avgMargin.toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Across all variants
          </p>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-3 shadow-sm">
        <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 shrink-0">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Status
          </p>
          <p className="text-sm font-extrabold text-teal-700 dark:text-teal-400 leading-none mt-1">
            {stats.status}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            All variants active
          </p>
        </div>
      </div>
    </div>
  );
};
