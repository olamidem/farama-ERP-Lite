import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { SupplierFormData } from "../../validations/supplierSchema";

interface SupplierContactInformationProps {
  register: UseFormRegister<SupplierFormData>;
  errors: FieldErrors<SupplierFormData>;
}

export default function SupplierContactInformation({
  register,
  errors,
}: SupplierContactInformationProps) {
  return (
    <div className="space-y-4 text-left">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 border-b border-slate-50 dark:border-slate-800 pb-1.5">
        Contact Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contact Person */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Contact Person
          </label>
          <input
            type="text"
            placeholder="e.g. Maria Santos"
            {...register("contact_person")}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Phone Number
          </label>
          <input
            type="text"
            placeholder="e.g. +63 912 345 6789"
            {...register("phone")}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            placeholder="e.g. contact@supplier.com"
            {...register("email")}
            className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition ${
              errors.email ? "border-red-500" : "border-slate-200 dark:border-slate-700"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-[10px] font-semibold mt-1">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
