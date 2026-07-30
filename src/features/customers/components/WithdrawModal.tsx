import { useState } from "react";
import { X, ArrowUpRight, Loader2, DollarSign, Landmark, AlertCircle } from "lucide-react";
import type { Customer } from "../types/customer";
import type { WalletPaymentMethod } from "../types/wallet";
import { useWithdrawWallet } from "../hooks/useCustomerWallet";
import useAuthStore from "../../auth/store/authStore";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export default function WithdrawModal({ isOpen, onClose, customer }: WithdrawModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<WalletPaymentMethod>("CASH");
  const [notes, setNotes] = useState<string>("");
  const [reference, setReference] = useState<string>("");

  const withdrawMutation = useWithdrawWallet();
  const currentUser = useAuthStore((state) => state.user);

  const handleClose = () => {
    setAmount("");
    setPaymentMethod("CASH");
    setNotes("");
    setReference("");
    onClose();
  };

  if (!isOpen || !customer) return null;

  const currentBalance = customer.wallet_balance || 0;
  const numAmount = Number(amount) || 0;
  const projectedBalance = Math.max(0, currentBalance - numAmount);
  const isOverBalance = numAmount > currentBalance;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0 || isOverBalance) return;

    try {
      await withdrawMutation.mutateAsync({
        customer_id: customer.id,
        amount: numAmount,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
        reference: reference.trim() || undefined,
         performed_by: currentUser?.id,
      });
      handleClose();
    } catch {
      // Handled by mutation toast
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-rose-500 text-white shadow-sm">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Withdraw Wallet Funds
              </h3>
              <p className="text-[10px] font-bold text-rose-700 dark:text-rose-400">
                Customer: {customer.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold transition p-1.5 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleWithdraw} className="p-6 space-y-4">
          {customer.status === "SUSPENDED" && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>Account is SUSPENDED. Activate this customer account before performing any withdrawal activities.</span>
            </div>
          )}

          {/* Balance Preview Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
                Available Balance
              </span>
              <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                ₦{currentBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest block">
                Remaining Balance
              </span>
              <span
                className={`text-base font-black ${
                  isOverBalance ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-100"
                }`}
              >
                ₦{projectedBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
              Withdrawal Amount (₦) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 dark:text-slate-500">
                ₦
              </span>
              <input
                type="number"
                min="1"
                max={currentBalance}
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-800 text-base font-black rounded-2xl border ${
                  isOverBalance
                    ? "border-rose-500 text-rose-600 dark:text-rose-400 focus:ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:border-rose-500 focus:ring-rose-500/20"
                } focus:ring-2 focus:outline-none transition`}
              />
            </div>
            {isOverBalance && (
              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                <span>Requested amount exceeds available wallet balance.</span>
              </p>
            )}
            {/* Shortcut buttons */}
            <div className="flex gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setAmount(String(currentBalance))}
                className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[10px] font-black transition cursor-pointer"
              >
                Withdraw Full Balance (₦{currentBalance.toLocaleString()})
              </button>
            </div>
          </div>

          {/* Payout Method */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
              Payout Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "CASH", label: "Cash Payout", icon: DollarSign },
                { id: "BANK_TRANSFER", label: "Bank Transfer Out", icon: Landmark },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as WalletPaymentMethod)}
                    className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 font-extrabold"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] uppercase tracking-wider">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Reference */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
              Reference / Bank Confirmation Code
            </label>
            <input
              type="text"
              placeholder="e.g. WTH-VOUCHER-09 or Bank Ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
              Withdrawal Reason / Memo
            </label>
            <textarea
              rows={2}
              placeholder="Reason for withdrawing funds..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={numAmount <= 0 || isOverBalance || withdrawMutation.isPending || customer.status === "SUSPENDED"}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider transition shadow-md shadow-rose-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {withdrawMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>Debit Wallet (₦{numAmount.toLocaleString()})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
