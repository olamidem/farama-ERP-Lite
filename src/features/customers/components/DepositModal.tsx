import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDownLeft,
  CreditCard,
  DollarSign,
  Landmark,
  Loader2,
  X,
} from "lucide-react";
import type { Customer } from "../types/customer";
import type {
  CustomerWallet,
  WalletDepositInput,
  WalletPaymentMethod,
} from "../types/wallet";
import {
  depositSchema,
  type DepositFormInput,
} from "../validation/customer.schema";
import { useDepositWallet } from "../hooks/useCustomerWallet";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  wallet: CustomerWallet | null;
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
  {
    value: "CARD",
    label: "POS / Card",
    icon: CreditCard,
  },
];

export default function DepositModal({
  isOpen,
  onClose,
  customer,
  wallet,
}: DepositModalProps) {
  const depositMutation = useDepositWallet();

  const {
    register,
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<DepositFormInput>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      wallet_id: "",
      amount: 0,
      payment_method: "CASH",
      notes: "",
      reference: "",
    },
  });

  useEffect(() => {
    if (wallet) {
      reset({
        wallet_id: wallet.id,
        amount: 0,
        payment_method: "CASH",
        notes: "",
        reference: "",
      });
    }
  }, [wallet, reset]);

  if (!isOpen || !customer || !wallet) return null;

  const amount = Number(watch("amount")) || 0;

  const currentBalance = wallet.balance;

  const projectedBalance = currentBalance + amount;

  const onSubmit = async (data: DepositFormInput) => {
    const payload: WalletDepositInput = {
      ...data,
      reference:
        data.reference ||
        `DEP-${Date.now()}`,
      performed_by: "CURRENT_USER",
    };

    await depositMutation.mutateAsync(payload);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">

        <div className="flex items-center justify-between px-6 py-5 border-b">

          <div>
            <h2 className="text-lg font-black">
              Deposit Wallet Funds
            </h2>

            <p className="text-xs text-slate-500">
              {customer.name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100"
          >
            <X size={18} />
          </button>

        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-5"
        >

          <div className="rounded-2xl border bg-slate-50 p-4 flex justify-between">

            <div>
              <p className="text-[10px] uppercase font-black text-slate-400">
                Current Balance
              </p>

              <p className="text-lg font-black">
                ₦{currentBalance.toLocaleString()}
              </p>
            </div>

            <div className="text-right">

              <p className="text-[10px] uppercase font-black text-emerald-500">
                Balance After
              </p>

              <p className="text-xl font-black text-emerald-600">
                ₦{projectedBalance.toLocaleString()}
              </p>

            </div>

          </div>

          <div>

            <label className="text-xs font-bold">
              Deposit Amount
            </label>

            <div className="relative mt-2">

              <span className="absolute left-4 top-3 font-bold">
                ₦
              </span>

              <input
                type="number"
                step="0.01"
                {...register("amount", {
                  valueAsNumber: true,
                })}
                className="w-full pl-8 pr-4 py-3 rounded-xl border"
              />

            </div>

            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">
                {errors.amount.message}
              </p>
            )}

          </div>

          <div>

            <label className="text-xs font-bold">
              Payment Method
            </label>

            <div className="grid grid-cols-3 gap-2 mt-2">

              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;

                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() =>
                      setValue(
                        "payment_method",
                        method.value
                      )
                    }
                    className={`rounded-xl border p-3 flex flex-col items-center gap-2 ${
                      watch("payment_method") ===
                      method.value
                        ? "border-emerald-600 bg-emerald-50"
                        : ""
                    }`}
                  >
                    <Icon size={18} />

                    <span className="text-xs font-bold">
                      {method.label}
                    </span>
                  </button>
                );
              })}

            </div>

          </div>

          <div>

            <label className="text-xs font-bold">
              Reference
            </label>

            <input
              {...register("reference")}
              className="mt-2 w-full rounded-xl border p-3"
              placeholder="Leave blank to auto-generate"
            />

          </div>

          <div>

            <label className="text-xs font-bold">
              Notes
            </label>

            <textarea
              rows={3}
              {...register("notes")}
              className="mt-2 w-full rounded-xl border p-3"
            />

          </div>

          <div className="rounded-xl bg-slate-50 border p-4">

            <h3 className="font-bold text-sm mb-2">
              Transaction Summary
            </h3>

            <div className="flex justify-between text-sm">
              <span>Customer</span>
              <strong>{customer.name}</strong>
            </div>

            <div className="flex justify-between text-sm">
              <span>Amount</span>
              <strong>
                ₦{amount.toLocaleString()}
              </strong>
            </div>

            <div className="flex justify-between text-sm">
              <span>New Balance</span>
              <strong className="text-emerald-600">
                ₦{projectedBalance.toLocaleString()}
              </strong>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border"
            >
              Cancel
            </button>

            <button
              disabled={depositMutation.isPending}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white flex items-center gap-2"
            >
              {depositMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowDownLeft size={16} />
                  Deposit Funds
                </>
              )}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}