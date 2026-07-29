import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Send,
  X,
  Loader2,
  ArrowRight,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import type { Customer } from "../types/customer";
import { formatCurrency } from "../utils/wallet.utils";

const transferSchema = z.object({
  recipient_id: z.string().min(1, "Please select a recipient customer"),
  amount: z.number().gt(0, "Transfer amount must be greater than 0"),
  notes: z.string().trim().optional().or(z.string().length(0)),
});

export type TransferFormInput = z.infer<typeof transferSchema>;

interface WalletTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderCustomer: Customer | null;
  allCustomers: Customer[];
  onTransfer: (data: {
    senderId: string;
    recipientId: string;
    amount: number;
    notes?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export default function WalletTransferModal({
  isOpen,
  onClose,
  senderCustomer,
  allCustomers,
  onTransfer,
  isLoading = false,
}: WalletTransferModalProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<Customer | null>(
    null,
  );

  const eligibleRecipients = allCustomers.filter(
    (c) => c.id !== senderCustomer?.id && c.id !== "walk-in-customer-id",
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransferFormInput>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipient_id: "",
      amount: 0,
      notes: "",
    },
  });

  const transferAmount = watch("amount") || 0;
  const senderBalance = senderCustomer?.wallet_balance || 0;
  const isInsufficient = transferAmount > senderBalance;

  if (!isOpen || !senderCustomer) return null;

  const handleFormSubmit = async (data: TransferFormInput) => {
    if (isInsufficient) return;
    await onTransfer({
      senderId: senderCustomer.id,
      recipientId: data.recipient_id,
      amount: data.amount,
      notes: data.notes,
    });
    reset();
    setSelectedRecipient(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Wallet Balance Transfer
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                Transfer store wallet credit to another registered account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="p-5 space-y-4"
        >
          {/* Sender Overview Card */}
          <div className="p-3.5 bg-indigo-50/50 border border-indigo-100/80 rounded-2xl flex items-center justify-between">
            <div>
              <span className="block text-[8px] font-black uppercase tracking-widest text-indigo-500">
                Sender Account
              </span>
              <span className="text-xs font-black text-slate-800 block mt-0.5">
                {senderCustomer.name}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">
                Available Credit
              </span>
              <span className="text-sm font-black font-mono text-indigo-600 block mt-0.5">
                {formatCurrency(senderBalance)}
              </span>
            </div>
          </div>

          {/* Select Recipient */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              Select Recipient Customer
            </label>
            <select
              {...register("recipient_id")}
              onChange={(e) => {
                const recId = e.target.value;
                setValue("recipient_id", recId);
                const found =
                  eligibleRecipients.find((c) => c.id === recId) || null;
                setSelectedRecipient(found);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition cursor-pointer"
            >
              <option value="">-- Choose registered customer --</option>
              {eligibleRecipients.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.name} ({rec.phone || "No phone"}) - Bal:{" "}
                  {formatCurrency(rec.wallet_balance || 0)}
                </option>
              ))}
            </select>
            {errors.recipient_id && (
              <p className="text-[10px] font-bold text-rose-500 mt-1">
                {errors.recipient_id.message}
              </p>
            )}
          </div>

          {selectedRecipient && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center gap-2 text-[10px] text-emerald-800 font-semibold">
              <UserCheck className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                Recipient current balance:{" "}
                {formatCurrency(selectedRecipient.wallet_balance || 0)}
              </span>
            </div>
          )}

          {/* Amount Field */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              Transfer Amount (NGN)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-black text-slate-400 text-xs">
                ₦
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("amount", { valueAsNumber: true })}
                className={`w-full rounded-2xl border ${
                  isInsufficient
                    ? "border-rose-300 bg-rose-50/30"
                    : "border-slate-200 bg-slate-50/50"
                } py-2.5 pl-8 pr-3.5 font-mono text-xs font-black text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition`}
              />
            </div>
            {errors.amount && (
              <p className="text-[10px] font-bold text-rose-500 mt-1">
                {errors.amount.message}
              </p>
            )}
            {isInsufficient && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-rose-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Amount exceeds available sender wallet balance (
                  {formatCurrency(senderBalance)})
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              Transfer Notes / Memo (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Gift store credit, family allowance transfer..."
              {...register("notes")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition"
            />
          </div>

          {/* Preview Transfer Summary */}
          {transferAmount > 0 && !isInsufficient && selectedRecipient && (
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1.5 text-[10px]">
              <div className="flex justify-between font-bold text-slate-600">
                <span>Sender New Balance:</span>
                <span className="font-mono text-indigo-600">
                  {formatCurrency(senderBalance - transferAmount)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-slate-600">
                <span>Recipient New Balance:</span>
                <span className="font-mono text-emerald-600">
                  {formatCurrency(
                    (selectedRecipient.wallet_balance || 0) + transferAmount,
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-extrabold text-[10px] uppercase tracking-wider cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isInsufficient || !selectedRecipient}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-[10px] uppercase tracking-wider cursor-pointer shadow-xs transition flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>Execute Transfer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
