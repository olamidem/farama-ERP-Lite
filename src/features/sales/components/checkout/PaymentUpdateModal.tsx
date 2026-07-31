import { useState } from "react";
import { X, CreditCard, Banknote, Landmark, Wallet } from "lucide-react";
import type { Sale } from "../../types/sale";
import type { PaymentMethod } from "../../types/payment";
import { formatCurrency } from "../../utils/pricing";
import { useUpdateSalePayment } from "../../hooks/useSales";

interface PaymentUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const PaymentUpdateModal = ({
  isOpen,
  onClose,
  sale,
}: PaymentUpdateModalProps) => {
  const updatePaymentMutation = useUpdateSalePayment();

  const currentPaid = sale ? Number(sale.amount_paid ?? sale.payable_amount ?? 0) : 0;
  const totalPayable = sale ? Number(sale.payable_amount ?? 0) : 0;
  const remainingBalance = Math.max(0, totalPayable - currentPaid);

  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [notes, setNotes] = useState("");
  const [prevSaleId, setPrevSaleId] = useState<string | null>(null);

  if (sale && sale.id !== prevSaleId) {
    setPrevSaleId(sale.id);
    setAmount(remainingBalance);
    setPaymentMethod("CASH");
    setNotes("");
  }

  if (!isOpen || !sale) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    updatePaymentMutation.mutate(
      {
        saleId: sale.id,
        amount,
        paymentMethod,
        notes,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const paymentMethods: { id: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "CASH", label: "Cash", icon: Banknote },
    { id: "POS", label: "Card / POS", icon: CreditCard },
    { id: "TRANSFER", label: "Transfer", icon: Landmark },
    { id: "WALLET", label: "Wallet", icon: Wallet },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center w-9 h-9">
                ₦
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Record Payment
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sale #{sale.sale_number} • {sale.customer_name}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Summary Box */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                {formatCurrency(totalPayable)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Paid</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(currentPaid)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-500 block">Outstanding</span>
              <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                {formatCurrency(remainingBalance)}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Payment Amount
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={remainingBalance}
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount"
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setAmount(remainingBalance)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 transition-colors"
              >
                Pay Full
              </button>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-500" />
                    <span>{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes / Reference */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Payment Notes / Ref (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bank Ref #1234, cash deposit..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={amount <= 0 || updatePaymentMutation.isPending}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {updatePaymentMutation.isPending ? "Recording..." : "Confirm Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentUpdateModal;
