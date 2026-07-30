import { X, Printer, RotateCcw, User, Phone, Calendar, FileText } from "lucide-react";
import type { Sale } from "../../types/sale";
import { formatCurrency } from "../../utils/pricing";
import { PAYMENT_METHOD_DETAILS } from "../../constants";

interface SaleDetailsProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReceipt: (sale: Sale) => void;
  onRefundSale: (saleId: string) => void;
  isRefunding?: boolean;
}

export const SaleDetails = ({
  sale,
  isOpen,
  onClose,
  onOpenReceipt,
  onRefundSale,
  isRefunding,
}: SaleDetailsProps) => {
  if (!isOpen || !sale) return null;

  const paymentDetail = PAYMENT_METHOD_DETAILS[sale.payment_method] || PAYMENT_METHOD_DETAILS.CASH;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
              {sale.sale_number}
            </span>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
              Transaction Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar text-xs">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <User className="w-3.5 h-3.5" /> Customer
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200">{sale.customer_name}</p>
              {sale.customer_phone && (
                <p className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {sale.customer_phone}
                </p>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" /> Date & Time
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {new Date(sale.created_at).toLocaleString()}
              </p>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  sale.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                }`}
              >
                {sale.status}
              </span>
            </div>
          </div>

          {/* Payment Method Badge */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-500 font-medium">Payment Method:</span>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${paymentDetail.badgeBg}`}
            >
              {paymentDetail.label}
            </span>
          </div>

          {/* Purchased Line Items */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-700 dark:text-slate-300">Items Purchased</h4>
            <div className="space-y-2">
              {(sale.items || []).map((item) => (
                <div
                  key={item.id || item.product_id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-100">
                      {item.product?.name || "Product"}
                    </h5>
                    <p className="text-slate-400 text-[11px]">
                      {item.quantity} x {formatCurrency(item.unit_price)} (
                      {item.product_unit?.unit?.symbol || "unit"})
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.total_price || item.quantity * item.unit_price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatCurrency(sale.subtotal || sale.payable_amount)}</span>
            </div>
            {sale.discount_amount > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Discount</span>
                <span>-{formatCurrency(sale.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>VAT / Tax</span>
              <span>+{formatCurrency(sale.tax_amount || 0)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
              <span>Total Payable Amount</span>
              <span className="text-blue-600 dark:text-blue-400 font-black">
                {formatCurrency(sale.payable_amount)}
              </span>
            </div>
          </div>

          {sale.remarks && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Remarks / Notes
              </span>
              <p className="text-slate-700 dark:text-slate-300">{sale.remarks}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={() => onOpenReceipt(sale)}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>

          {sale.status === "COMPLETED" && (
            <button
              type="button"
              disabled={isRefunding}
              onClick={() => onRefundSale(sale.id)}
              className="py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Refund
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleDetails;
