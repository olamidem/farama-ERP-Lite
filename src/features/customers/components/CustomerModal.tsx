import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Loader2, Save, X } from "lucide-react";
import type { Customer } from "../types/customer";
import { customerSchema, type CustomerFormInput } from "../validation/customer.schema";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSave: (data: CustomerFormInput) => Promise<void>;
  isLoading?: boolean;
}

export default function CustomerModal({
  isOpen,
  onClose,
  customer,
  onSave,
  isLoading,
}: CustomerModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      remarks: "",
    },
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        remarks: customer.remarks || "",
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        address: "",
        remarks: "",
      });
    }
  }, [customer, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            {customer ? "Edit Customer Account" : "New Customer Account"}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 font-bold transition p-1 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Adebayo Adesina"
              {...register("name")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition"
            />
            {errors.name && (
              <p className="text-[10px] text-rose-500 font-extrabold tracking-wide uppercase mt-0.5">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+234 803 123 4567"
                {...register("phone")}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                placeholder="adebayo@example.com"
                {...register("email")}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition"
              />
              {errors.email && (
                <p className="text-[10px] text-rose-500 font-extrabold tracking-wide uppercase mt-0.5">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Physical Address
            </label>
            <input
              type="text"
              placeholder="12 Marina Street, Lagos"
              {...register("address")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Private Remarks / Notes
            </label>
            <textarea
              placeholder="Additional comments..."
              rows={3}
              {...register("remarks")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold text-[10px] uppercase tracking-wider cursor-pointer shadow-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-[10px] uppercase tracking-wider cursor-pointer shadow-sm transition"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>{customer ? "Save Changes" : "Create Account"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
