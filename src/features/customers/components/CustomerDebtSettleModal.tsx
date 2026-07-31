import React, { useState } from "react";
import { X, Scale, CreditCard, Banknote, Wallet, Building2, CheckCircle2 } from "lucide-react";
import type { Customer } from "../types/customer";
import type { PaymentMethod } from "../../sales/types/payment";
import type { Sale } from "../../sales/types/sale";
import { formatNaira } from "../lib/customerExport";
import { useSettleCustomerDebt } from "../hooks/useCustomerDebt";

interface CustomerDebtSettleModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  outstandingDebt: number;
  unpaidSales?: Sale[];
  walletBalance?: number;
}

export default function CustomerDebtSettleModal({
  isOpen,
  onClose,
  customer,
  outstandingDebt,
  unpaidSales = [],
  walletBalance = 0,
}: CustomerDebtSettleModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [selectedSaleId, setSelectedSaleId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const settleDebtMutation = useSettleCustomerDebt();

  if (!isOpen || !customer) return null;

  const numericAmount = parseFloat(amount) || 0;

  const handleFullDebtSelect = () => {
    setAmount(outstandingDebt.toString());
  };

  const handleHalfDebtSelect = () => {
    setAmount((outstandingDebt / 2).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) return;

    if (paymentMethod === "WALLET" && numericAmount > walletBalance) {
      return;
    }

    try {
      await settleDebtMutation.mutateAsync({
        customerId: customer.id,
        amount: numericAmount,
        paymentMethod,
        notes: notes.trim() || undefined,
        saleId: selectedSaleId || undefined,
      });
      onClose();
      setAmount("");
      setNotes("");
      setSelectedSaleId("");
    } catch {
      // Toast handles error
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                Settle Customer Debt
              </h3>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                Record debt repayment for {customer.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Outstanding Summary Card */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Current Debt Balance
              </span>
              <div className="text-xl font-black font-mono text-amber-900 dark:text-amber-200">
                {formatNaira(outstandingDebt)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Wallet Balance
              </span>
              <div className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                {formatNaira(walletBalance)}
              </div>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
              <span>Repayment Amount (₦)</span>
              {outstandingDebt > 0 && (
                <div className="flex gap-2 text-[10px] font-extrabold">
                  <button
                    type="button"
                    onClick={handleHalfDebtSelect}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    50% Debt
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={handleFullDebtSelect}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Pay Full Debt
                  </button>
                </div>
              )}
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max={outstandingDebt || 10000000}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter repayment amount..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden transition"
            />
          </div>

          {/* Target Specific Invoice / Sale (Optional) */}
          {unpaidSales.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Apply to Unpaid Invoice (Optional)
              </label>
              <select
                value={selectedSaleId}
                onChange={(e) => setSelectedSaleId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-hidden transition cursor-pointer"
              >
                <option value="">Apply to overall customer debt</option>
                {unpaidSales.map((s) => {
                  const paid = Number(s.amount_paid ?? s.payable_amount ?? 0);
                  const payable = Number(s.payable_amount ?? 0);
                  const due = Math.max(0, payable - paid);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.sale_number} ({new Date(s.created_at).toLocaleDateString()}) — Due: {formatNaira(due)}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                  paymentMethod === "CASH"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Banknote className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Cash Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("TRANSFER")}
                className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                  paymentMethod === "TRANSFER"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Building2 className="h-4 w-4 shrink-0 text-blue-600" />
                <span>Bank Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("POS")}
                className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                  paymentMethod === "POS"
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <CreditCard className="h-4 w-4 shrink-0 text-purple-600" />
                <span>POS Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("WALLET")}
                disabled={walletBalance < numericAmount}
                className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition ${
                  paymentMethod === "WALLET"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                    : walletBalance < numericAmount
                    ? "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                }`}
              >
                <Wallet className="h-4 w-4 shrink-0 text-indigo-600" />
                <div className="text-left">
                  <div>Wallet Balance</div>
                  <div className="text-[10px] text-slate-400">
                    {formatNaira(walletBalance)}
                  </div>
                </div>
              </button>
            </div>
            {paymentMethod === "WALLET" && walletBalance < numericAmount && numericAmount > 0 && (
              <p className="text-[11px] font-bold text-rose-500 mt-1">
                Insufficient wallet balance. Top up wallet first or choose another method.
              </p>
            )}
          </div>

          {/* Notes / Reference */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Remarks / Reference (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bank transfer ref #12345 or Cash receipt..."
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-hidden transition"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                settleDebtMutation.isPending ||
                numericAmount <= 0 ||
                (paymentMethod === "WALLET" && numericAmount > walletBalance)
              }
              className="flex-1 py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md shadow-amber-600/20 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {settleDebtMutation.isPending ? "Processing..." : "Confirm Repayment"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
