import { X, ShoppingBag, Calendar, Printer, CreditCard } from "lucide-react";
import type { Sale } from "../../sales/types/sale";
import { formatNaira } from "../lib/customerExport";

interface CustomerSaleDetailModalProps {
  sale: Sale | null;
  onClose: () => void;
  onOpenReceipt: (sale: Sale) => void;
}

export default function CustomerSaleDetailModal({
  sale,
  onClose,
  onOpenReceipt,
}: CustomerSaleDetailModalProps) {
  if (!sale) return null;

  const payable = Number(sale.payable_amount || sale.total_amount || 0);
  const paid = Number(sale.amount_paid ?? payable);
  const balance = Math.max(0, payable - paid);

  const handlePrintReceipt = () => {
    onClose();
    onOpenReceipt(sale);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100 font-mono">
                  {sale.sale_number}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    balance > 0
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300"
                  }`}
                >
                  {balance > 0 ? "Credit Sale / Partial" : "Paid"}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3" />
                {new Date(sale.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintReceipt}
              className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Print Thermal Receipt"
            >
              <Printer className="h-4 w-4" />
              <span>Print Receipt</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Payment status cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total Amount
              </span>
              <div className="text-sm font-black font-mono text-slate-800 dark:text-slate-100 mt-0.5">
                {formatNaira(payable)}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Amount Paid
              </span>
              <div className="text-sm font-black font-mono text-emerald-800 dark:text-emerald-200 mt-0.5">
                {formatNaira(paid)}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Balance Due
              </span>
              <div className="text-sm font-black font-mono text-amber-800 dark:text-amber-200 mt-0.5">
                {formatNaira(balance)}
              </div>
            </div>
          </div>

          {/* Payment Method & Cashier Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-indigo-500" />
              <span>Payment Method:</span>
              <span className="font-extrabold uppercase text-slate-900 dark:text-white">
                {sale.payment_method}
              </span>
            </div>

            {sale.remarks && (
              <div className="text-[11px] text-slate-400 italic">
                "{sale.remarks}"
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Purchased Line Items ({sale.items?.length || 0})
            </h4>
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {!sale.items || sale.items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 font-bold">
                        No line items detail stored for this sale.
                      </td>
                    </tr>
                  ) : (
                    sale.items.map((item, idx) => {
                      const productName =
                        item.product?.name || `Item #${idx + 1}`;
                      const qty = item.quantity;
                      const unitPrice = item.unit_price;
                      const lineTotal = item.line_total || item.total_price || qty * unitPrice;

                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100">
                            {productName}
                            {item.product_unit?.unit?.name && (
                              <span className="ml-1 text-[10px] text-slate-400 font-normal">
                                ({item.product_unit.unit.name})
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-extrabold text-slate-700 dark:text-slate-300">
                            {qty}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                            {formatNaira(unitPrice)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                            {formatNaira(lineTotal)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-between items-center shrink-0">
          <button
            onClick={handlePrintReceipt}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="h-4 w-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
