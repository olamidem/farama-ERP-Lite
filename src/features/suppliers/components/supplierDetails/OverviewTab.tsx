import { FileText } from "lucide-react";
import type { SupplierWithStats } from "../../types/supplier";

interface OverviewTabProps {
  supplier: SupplierWithStats;
}

export default function OverviewTab({ supplier }: OverviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
        <FileText className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
        <h4 className="text-sm font-bold">Supplier Remarks & Notes</h4>
      </div>

      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs transition-colors">
        {supplier.remarks_text ? (
          <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
            {supplier.remarks_text}
          </p>
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-400 dark:text-slate-500 text-xs italic">
              No notes or remarks have been recorded for this supplier.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
