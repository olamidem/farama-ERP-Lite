import { useState } from "react";
import { X, ArrowDownLeft, Loader2, DollarSign, CreditCard, Landmark } from "lucide-react";
import type { Customer } from "../types/customer";
import type { WalletPaymentMethod } from "../types/wallet";
import { useDepositWallet } from "../hooks/useCustomerWallet";
import useAuthStore from "../../auth/store/authStore";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export default function DepositModal({ isOpen, onClose, customer }: DepositModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<WalletPaymentMethod>("CASH");
  const [notes, setNotes] = useState<string>("");
  const [reference, setReference] = useState<string>("");

  const depositMutation = useDepositWallet();
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
  const projectedBalance = currentBalance + numAmount;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    try {
      await depositMutation.mutateAsync({
        customer_id: customer.id,
        amount: numAmount,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
        reference: reference.trim() || undefined,
         performed_by: currentUser?.id,
      });
      handleClose();
    } catch (error) {
    console.error(error);
    // Error toast is already handled inside the mutation
  }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-emerald-500 text-white shadow-xs">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Deposit Wallet Funds
              </h3>
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
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
        <form onSubmit={handleDeposit} className="p-6 space-y-4">
          {customer.status === "SUSPENDED" && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>Account is SUSPENDED. Activate this customer account before performing any deposit activities.</span>
            </div>
          )}

          {/* Balance Preview Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
                Current Balance
              </span>
              <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                ₦{currentBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                After Deposit
              </span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                ₦{projectedBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
              Deposit Amount (₦) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 dark:text-slate-500">
                ₦
              </span>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-800 text-base font-black text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition"
              />
            </div>
            {/* Quick amount shortcuts */}
            <div className="flex gap-1.5 pt-1">
              {[1000, 5000, 10000, 25000, 50000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(String(val))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-400 text-[10px] font-extrabold text-slate-600 dark:text-slate-300 transition cursor-pointer"
                >
                  +₦{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
              Payment Source
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "CASH", label: "Cash", icon: DollarSign },
                { id: "BANK_TRANSFER", label: "Transfer", icon: Landmark },
                { id: "CARD", label: "POS / Card", icon: CreditCard },
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
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-extrabold"
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
              Reference / Teller No. (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. TRF-982312 or Cash Teller #4"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
              Transaction Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Advance wallet deposit for medicine supply..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-emerald-500"
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
              disabled={numAmount <= 0 || depositMutation.isPending || customer.status === "SUSPENDED"}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {depositMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowDownLeft className="h-3.5 w-3.5" />
                  <span>Credit Wallet (₦{numAmount.toLocaleString()})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
