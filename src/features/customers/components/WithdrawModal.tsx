import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowUpRight,
  DollarSign,
  Landmark,
  Loader2,
  X,
} from "lucide-react";

import type { Customer } from "../types/customer";
import type { WalletPaymentMethod } from "../types/wallet";
import {
  withdrawalSchema,
  type WithdrawalFormInput,
} from "../validation/customer.schema";
import {
  useCustomerWallet,
  useWithdrawWallet,
} from "../hooks/useCustomerWallet";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const PAYMENT_METHODS: {
  value: WalletPaymentMethod;
  label: string;
  icon: typeof DollarSign;
}[] = [
  {
    value: "CASH",
    label: "Cash",
    icon: DollarSign,
  },
  {
    value: "BANK_TRANSFER",
    label: "Transfer",
    icon: Landmark,
  },
];

export default function WithdrawModal({
  isOpen,
  onClose,
  customer,
}: WithdrawModalProps) {
  const withdrawMutation = useWithdrawWallet();
  const { data: wallet } = useCustomerWallet(customer?.id ?? "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<WithdrawalFormInput>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      wallet_id: wallet?.id || "",
      amount: 0,
      payment_method: "CASH",
      notes: "",
      reference: "",
      performed_by: "Store Cashier",
    },
  });

  const watchAmount = watch("amount") || 0;
  const watchPaymentMethod = watch("payment_method");

  useEffect(() => {
    if (wallet?.id) {
      setValue("wallet_id", wallet.id);
    }
  }, [wallet?.id, setValue]);

  useEffect(() => {
    if (!isOpen) {
      reset({
        wallet_id: wallet?.id || "",
        amount: 0,
        payment_method: "CASH",
        notes: "",
        reference: "",
        performed_by: "Store Cashier",
      });
    }
  }, [isOpen, reset, wallet?.id]);

  if (!isOpen || !customer || !wallet) return null;

  const currentBalance = wallet.balance ?? 0;
  const projectedBalance = Math.max(0, currentBalance - watchAmount);
  const isOverBalance = watchAmount > currentBalance;

  const onSubmit = async (data: WithdrawalFormInput) => {
    if (data.amount <= 0 || data.amount > currentBalance) return;

    await withdrawMutation.mutateAsync({
      customer_id: customer.id,
      amount: data.amount,
      payment_method: data.payment_method,
      notes: data.notes?.trim() || undefined,
      reference: data.reference?.trim() || undefined,
      performed_by: "Store Cashier",
    });

    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Withdraw Wallet Funds
            </h2>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              Customer: {customer.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-slate-100"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <input type="hidden" {...register("wallet_id")} />

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Available Balance
              </span>

              <span className="text-sm font-black text-slate-700">
                ₦
                {currentBalance.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="text-right">
              <span className="block text-[10px] font-black uppercase tracking-widest text-rose-600">
                Remaining
              </span>

              <span
                className={`text-base font-black ${
                  isOverBalance ? "text-rose-600" : "text-slate-800"
                }`}
              >
                ₦
                {projectedBalance.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
              Withdrawal Amount
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-400">
                ₦
              </span>

              <input
                type="number"
                step="any"
                min={1}
                max={currentBalance}
                {...register("amount", { valueAsNumber: true })}
                className={`w-full rounded-2xl border py-3 pl-8 pr-4 text-base font-black transition focus:outline-none ${
                  isOverBalance || errors.amount
                    ? "border-rose-500 text-rose-600"
                    : "border-slate-200 text-slate-800 focus:border-rose-500"
                }`}
              />
            </div>

            {isOverBalance && (
              <p className="mt-2 flex items-center gap-1 text-[10px] font-bold text-rose-600">
                <AlertCircle className="h-3 w-3" />
                Amount exceeds wallet balance.
              </p>
            )}
            {errors.amount && !isOverBalance && (
              <p className="mt-2 flex items-center gap-1 text-[10px] font-bold text-rose-600">
                <AlertCircle className="h-3 w-3" />
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
              Payment Method
            </label>

            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((item) => {
                const Icon = item.icon;
                const isSelected = watchPaymentMethod === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setValue("payment_method", item.value)}
                    className={`flex flex-col items-center gap-1 rounded-2xl border p-3 transition ${
                      isSelected
                        ? "border-rose-500 bg-rose-50 text-rose-700"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />

                    <span className="text-[10px] font-bold uppercase">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="Reference"
              {...register("reference")}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
            />
          </div>

          <div>
            <textarea
              rows={2}
              placeholder="Notes"
              {...register("notes")}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                withdrawMutation.isPending ||
                watchAmount <= 0 ||
                isOverBalance
              }
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-xs font-black uppercase tracking-wider text-white disabled:opacity-50"
            >
              {withdrawMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Withdraw
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
