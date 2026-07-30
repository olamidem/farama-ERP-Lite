import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Loader2, Save, X, Landmark, Wallet, AlertTriangle } from "lucide-react";
import type { Customer } from "../types/customer";
import { topUpSchema, type TopUpFormInput } from "../validation/customer.schema";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSave: (data: TopUpFormInput) => Promise<void>;
  isLoading?: boolean;
}

export default function TopUpModal({
  isOpen,
  onClose,
  customer,
  onSave,
  isLoading,
}: TopUpModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TopUpFormInput>({
    resolver: zodResolver(topUpSchema),
    defaultValues: {
      type: "TOP_UP",
      amount: 0,
      remarks: "",
    },
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (isOpen) {
      reset({
        type: "TOP_UP",
        amount: 0,
        remarks: "",
      });
    }
  }, [isOpen, reset]);

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Post Ledger / Top Up
            </h3>
            <p className="text-[10px] font-bold text-indigo-600 mt-0.5">
              Customer: {customer.name}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 font-bold transition p-1 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit((data) => onSave(data))} className="p-6 space-y-4">
          
          {/* Transaction Type Select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Transaction Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setValue("type", "TOP_UP")}
                className={`py-2 px-3 text-[10px] font-extrabold uppercase tracking-wider rounded-xl border transition flex flex-col items-center justify-center gap-1.5 ${
                  selectedType === "TOP_UP"
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Wallet className="h-4 w-4" />
                <span>Wallet Deposit</span>
              </button>

              <button
                type="button"
                onClick={() => setValue("type", "PAYMENT")}
                className={`py-2 px-3 text-[10px] font-extrabold uppercase tracking-wider rounded-xl border transition flex flex-col items-center justify-center gap-1.5 ${
                  selectedType === "PAYMENT"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
                disabled={(customer.outstanding_debt || 0) <= 0}
                title={(customer.outstanding_debt || 0) <= 0 ? "No outstanding debt" : ""}
              >
                <Landmark className="h-4 w-4" />
                <span className={(customer.outstanding_debt || 0) <= 0 ? "opacity-50" : ""}>Pay Debt</span>
              </button>

              <button
                type="button"
                onClick={() => setValue("type", "DEBIT")}
                className={`py-2 px-3 text-[10px] font-extrabold uppercase tracking-wider rounded-xl border transition flex flex-col items-center justify-center gap-1.5 ${
                  selectedType === "DEBIT"
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Issue Debt</span>
              </button>
            </div>
          </div>

          {/* Balance Preview Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex justify-between text-center divide-x divide-slate-100">
            <div className="flex-1">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Wallet Balance
              </span>
              <span className="text-xs font-black text-indigo-600">
                ₦{Number(customer.wallet_balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex-1">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Outstanding Debt
              </span>
              <span className="text-xs font-black text-rose-600">
                ₦{Number(customer.outstanding_debt || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Transaction Amount (₦) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs">
                ₦
              </span>
              <input
                type="number"
                placeholder="0.00"
                step="any"
                {...register("amount", { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-8 pr-3.5 text-xs font-bold text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition font-mono"
              />
            </div>
            {errors.amount && (
              <p className="text-[10px] text-rose-500 font-extrabold tracking-wide uppercase mt-0.5">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Remarks input */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Ledger Remarks / Reference Note
            </label>
            <input
              type="text"
              placeholder="e.g. Cash Top up, Direct Bank Transfer reference..."
              {...register("remarks")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition"
            />
          </div>

          {/* Info/Warning note */}
          <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[9px] font-bold text-amber-700 leading-normal">
              Posting this ledger entry will adjust the customer's live wallet balances and create a permanent transaction trace in their ledger card.
            </p>
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
              <span>Post Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
