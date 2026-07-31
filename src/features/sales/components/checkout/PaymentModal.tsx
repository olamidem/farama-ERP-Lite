import { CheckCircle2 } from "lucide-react";
import type { PaymentMethod } from "../../types/payment";
import { formatCurrency } from "../../utils/pricing";
import { PAYMENT_METHOD_DETAILS } from "../../constants";

interface PaymentModalProps {
  paymentMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  payableAmount: number;
  cashTendered: number;
  onChangeCashTendered: (val: number) => void;
  changeDue: number;
  customerWalletBalance?: number;
}

export const PaymentModal = ({
  paymentMethod,
  onSelectMethod,
  payableAmount,
  cashTendered,
  onChangeCashTendered,
  changeDue,
  customerWalletBalance = 0,
}: PaymentModalProps) => {
  const methods: PaymentMethod[] = ["CASH", "POS", "TRANSFER", "WALLET"];

  const quickCashOptions = [
    payableAmount,
    Math.ceil(payableAmount / 500) * 500,
    Math.ceil(payableAmount / 1000) * 1000,
    Math.ceil(payableAmount / 5000) * 5000,
  ].filter((v, i, self) => v >= payableAmount && self.indexOf(v) === i);

  return (
    <div className="space-y-4">
      {/* Payment Method Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {methods.map((method) => {
          const detail = PAYMENT_METHOD_DETAILS[method];
          const isSelected = paymentMethod === method;
          return (
            <button
              key={method}
              type="button"
              onClick={() => onSelectMethod(method)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1 ${
                isSelected
                  ? `bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-2xs`
                  : `bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300`
              }`}
            >
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                {detail.label}
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                {detail.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cash Payment Details */}
      {paymentMethod === "CASH" && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Amount Tendered (Physical Cash Received)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={cashTendered || ""}
              onChange={(e) => onChangeCashTendered(Number(e.target.value))}
              placeholder="0.00"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-lg font-extrabold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Quick Cash Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {quickCashOptions.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => onChangeCashTendered(amt)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {formatCurrency(amt)}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500">Change Due to Customer</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(changeDue)}
            </span>
          </div>
        </div>
      )}

      {/* Wallet Payment Details */}
      {paymentMethod === "WALLET" && (
        <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
            <span>Customer Stored Wallet Balance:</span>
            <span className="font-extrabold">{formatCurrency(customerWalletBalance)}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-200 pt-1 border-t border-amber-200/60 dark:border-amber-900/60">
            <span>Amount to Deduct:</span>
            <span className="font-extrabold">{formatCurrency(payableAmount)}</span>
          </div>
          {customerWalletBalance < payableAmount && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">
              ⚠️ Insufficient balance! Top-up customer wallet or select Cash/POS payment.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentModal;
