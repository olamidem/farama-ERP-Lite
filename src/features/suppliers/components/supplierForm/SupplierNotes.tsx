import type { UseFormRegister } from "react-hook-form";
import type { SupplierFormData } from "../../validations/supplierSchema";

interface SupplierNotesProps {
  register: UseFormRegister<SupplierFormData>;
}

export default function SupplierNotes({ register }: SupplierNotesProps) {
  return (
    <div className="space-y-4 text-left">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 border-b border-slate-50 dark:border-slate-800 pb-1.5">
        Additional Remarks & Notes
      </h3>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Remarks / Description
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Primary food and beverage provider, specializes in organic imports..."
          {...register("remarks_text")}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-100 focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>
    </div>
  );
}
