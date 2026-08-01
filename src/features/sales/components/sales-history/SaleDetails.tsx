import { X, Printer, RotateCcw, User, Phone, Calendar, FileText } from "lucide-react";
import type { Sale } from "../../types/sale";
import { formatCurrency } from "../../utils/pricing";
import Barcode from "../receipt/Barcode";
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

  const paymentDetail = PAYMENT_METHOD_DETAILS[sale.payment_method as keyof typeof PAYMENT_METHOD_DETAILS] || PAYMENT_METHOD_DETAILS.CASH;

  const payableAmount = Number(sale.payable_amount || sale.total_amount || 0);
  const totalPaidFromLogs = sale.payments && sale.payments.length > 0
    ? sale.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    : Number(sale.amount_paid ?? payableAmount);
  const outstandingBalance = Math.max(0, payableAmount - totalPaidFromLogs);

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
                  outstandingBalance === 0
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                }`}
              >
                {outstandingBalance === 0 ? "PAID" : "PARTIALLY_PAID"}
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
                      {item.product_unit?.unit?.symbol || item.product_unit?.unit_name || "unit"})
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
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>Total Payable Amount</span>
              <span className="text-slate-900 dark:text-white font-black">
                {formatCurrency(payableAmount)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Total Amount Paid</span>
              <span>
                {formatCurrency(totalPaidFromLogs)}
              </span>
            </div>
            {outstandingBalance > 0 && (
              <div className="flex justify-between text-xs text-rose-600 dark:text-rose-400 font-extrabold pt-1 border-t border-rose-100 dark:border-rose-900/50">
                <span>Outstanding Balance</span>
                <span>
                  {formatCurrency(outstandingBalance)}
                </span>
              </div>
            )}
          </div>

          {/* Payment Audit Logs (from sale_payments table) */}
          {sale.payments && sale.payments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Payment Audit History ({sale.payments.length})</span>
                <span className="text-[10px] text-slate-400 font-normal">Immutable Logs</span>
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-0.5">
                {sale.payments.map((payment, idx) => (
                  <div
                    key={payment.id || idx}
                    className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono uppercase">
                          {payment.payment_method}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {payment.created_at ? new Date(payment.created_at).toLocaleString() : "Initial"}
                        </span>
                      </div>
                      {payment.notes && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {payment.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(payment.amount)}
                      </span>
                      {payment.performer?.full_name && (
                        <p className="text-[9px] text-slate-400 font-medium">
                          By: {payment.performer.full_name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Authentic Barcode Section */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Authentic Receipt Barcode</span>
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <Barcode value={sale.sale_number} height={38} width={1.5} fontSize={10} />
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              Scanning this barcode verifies and opens these transaction details.
            </span>
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
            onClick={() => {
              onClose();
              onOpenReceipt(sale);
            }}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
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
