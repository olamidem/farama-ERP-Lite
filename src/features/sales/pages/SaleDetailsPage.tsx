import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useSale, useRefundSale } from "../hooks/useSales";
import { ArrowLeft, Printer, RotateCcw } from "lucide-react";
import Receipt from "../components/receipt/Receipt";
import { formatCurrency } from "../utils/pricing";
import { PAYMENT_METHOD_DETAILS } from "../constants";

export const SaleDetailsPage = () => {
  const params = useParams({ strict: false });
  const saleId = (params as Record<string, string>)?.saleId || "";
  const navigate = useNavigate();

  const { data: sale, isLoading, error } = useSale(saleId);
  const refundMutation = useRefundSale();

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const handleRefund = async () => {
    if (!saleId) return;
    if (confirm("Are you sure you want to process a full refund for this sale?")) {
      await refundMutation.mutateAsync(saleId);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading sale details...</div>;
  }

  if (error || !sale) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-rose-600 font-bold">Failed to load transaction details.</p>
        <button
          onClick={() => navigate({ to: "/sales" })}
          className="text-xs font-bold text-blue-600 hover:underline"
        >
          Back to Sales
        </button>
      </div>
    );
  }

  const payDetail = PAYMENT_METHOD_DETAILS[sale.payment_method] || PAYMENT_METHOD_DETAILS.CASH;

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate({ to: "/sales" })}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sales
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsReceiptOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Receipt
          </button>
          {sale.status === "COMPLETED" && (
            <button
              type="button"
              disabled={refundMutation.isPending}
              onClick={handleRefund}
              className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 font-bold text-xs flex items-center gap-1.5 hover:bg-rose-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Refund
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
              {sale.sale_number}
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Customer Order #{sale.sale_number}
            </h1>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold ${
              sale.status === "COMPLETED"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
            }`}
          >
            {sale.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Customer</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{sale.customer_name}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Date</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {new Date(sale.created_at).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Payment Method</span>
            <span className={`inline-block font-bold text-slate-800 dark:text-slate-200 ${payDetail.badgeBg} px-2 py-0.5 rounded-md border`}>
              {payDetail.label}
            </span>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300">Order Items</h3>
          <div className="space-y-2">
            {(sale.items || []).map((item) => (
              <div
                key={item.id || item.product_id}
                className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.product?.name || "Product"}
                  </h4>
                  <p className="text-slate-400">
                    {item.quantity} x {formatCurrency(item.unit_price)}
                  </p>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(item.total_price || item.quantity * item.unit_price)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-2 text-xs border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatCurrency(sale.subtotal || sale.payable_amount)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Discount</span>
            <span>-{formatCurrency(sale.discount_amount || 0)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>VAT / Tax</span>
            <span>+{formatCurrency(sale.tax_amount || 0)}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
            <span>Total Amount Paid</span>
            <span className="text-blue-600 dark:text-blue-400 font-black">
              {formatCurrency(sale.payable_amount)}
            </span>
          </div>
        </div>
      </div>

      {isReceiptOpen && (
        <Receipt
          sale={sale}
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
        />
      )}
    </div>
  );
};

export default SaleDetailsPage;
