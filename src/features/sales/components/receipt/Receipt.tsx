import { Printer, CheckCircle2, X } from "lucide-react";
import type { Sale } from "../../types/sale";
import { formatReceiptData, printReceiptElement } from "../../utils/receipt";
import { formatCurrency } from "../../utils/pricing";

interface ReceiptProps {
  sale: Sale;
  isOpen: boolean;
  onClose: () => void;
  amountPaid?: number;
  change?: number;
}

export const Receipt = ({
  sale,
  isOpen,
  onClose,
  amountPaid,
  change,
}: ReceiptProps) => {
  if (!isOpen) return null;

  const data = formatReceiptData(sale, amountPaid, change);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Receipt Header Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              Sales Receipt #{data.receiptNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Receipt Printable Area */}
        <div
          id="receipt-print-area"
          className="bg-amber-50/40 dark:bg-slate-900 p-5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-3 overflow-y-auto flex-1 no-scrollbar"
        >
          {/* Store Info */}
          <div className="text-center space-y-1">
            <h2 className="text-sm font-bold tracking-wider">{data.storeName}</h2>
            <p className="text-[11px] text-slate-500">{data.storeAddress}</p>
            <p className="text-[11px] text-slate-500">{data.storePhone}</p>
          </div>

          <div className="border-t border-dashed border-slate-400 dark:border-slate-700 my-2" />

          {/* Transaction Metadata */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span className="font-bold">{data.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{data.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{data.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="font-bold uppercase">{data.paymentMethod}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-400 dark:border-slate-700 my-2" />

          {/* Line Items Table */}
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-dashed border-slate-400 dark:border-slate-700">
                <th className="py-1">QTY/ITEM</th>
                <th className="text-right py-1">PRICE</th>
                <th className="text-right py-1">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-1 pr-2">
                    {item.quantity}x {item.name} ({item.unit_name})
                  </td>
                  <td className="text-right py-1">{formatCurrency(item.unit_price)}</td>
                  <td className="text-right py-1 font-bold">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-slate-400 dark:border-slate-700 my-2" />

          {/* Totals Breakdown */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(data.subtotal)}</span>
            </div>
            {data.discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount:</span>
                <span>-{formatCurrency(data.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>VAT / Tax:</span>
              <span>+{formatCurrency(data.tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-300 dark:border-slate-700">
              <span>TOTAL:</span>
              <span>{formatCurrency(data.total)}</span>
            </div>
            {data.amountPaid !== undefined && (
              <div className="flex justify-between pt-1 text-slate-500">
                <span>Paid:</span>
                <span>{formatCurrency(data.amountPaid)}</span>
              </div>
            )}
            {data.change !== undefined && data.change > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Change:</span>
                <span>{formatCurrency(data.change)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-slate-400 dark:border-slate-700 my-2" />

          <p className="text-center text-[10px] text-slate-500 pt-1">
            Thank you for shopping with us! Please keep this receipt for return/refund reference.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => printReceiptElement("receipt-print-area")}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
