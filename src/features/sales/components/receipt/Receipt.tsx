import { useState } from "react";
import { Printer, CheckCircle2, X, Settings, Eye, FileText } from "lucide-react";
import type { Sale } from "../../types/sale";
import { formatReceiptData } from "../../utils/receipt";
import { formatCurrency } from "../../utils/pricing";
import Barcode from "./Barcode";
import ReceiptQRCode from "./ReceiptQRCode";
import ReceiptConfigModal from "./ReceiptConfigModal";
import ThermalPrintingModal from "../thermal/ThermalPrintingModal";

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
  const [viewMode, setViewMode] = useState<"compact" | "detailed">("detailed");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isThermalPrintingOpen, setIsThermalPrintingOpen] = useState(false);

  if (!isOpen || !sale) return null;

  const data = formatReceiptData(sale, amountPaid, change);

  const handlePrint = () => {
    setIsThermalPrintingOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-5 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 my-auto flex flex-col max-h-[92vh]">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 shrink-0">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                Thermal POS Receipt
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsConfigOpen(true)}
                className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                title="Configure Receipt Settings"
              >
                <Settings className="w-4 h-4 text-blue-500" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* View Mode Switch (Compact vs Detailed) */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl shrink-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-3 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>Layout View:</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("compact")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  viewMode === "compact"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Compact</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("detailed")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  viewMode === "detailed"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Detailed POS</span>
              </button>
            </div>
          </div>

          {/* Thermal Receipt Printable Preview Box */}
          <div
            id="receipt-print-area"
            className="bg-white text-black p-6 rounded-xl border border-slate-300 font-mono text-[11px] leading-tight space-y-2.5 overflow-y-auto flex-1 shadow-inner no-scrollbar select-text max-w-[320px] mx-auto w-full"
          >
            {/* Optional Logo */}
            {data.logoUrl && (
              <div className="text-center pb-1">
                <img
                  src={data.logoUrl}
                  alt="Logo"
                  className="max-h-12 max-w-[120px] mx-auto object-contain"
                />
              </div>
            )}

            {/* Header / Store Info */}
            <div className="text-center space-y-0.5">
              <h2 className="text-sm font-black uppercase tracking-wider">{data.storeName}</h2>
              <p className="text-[10px] text-slate-700">{data.storeAddress}</p>
              <p className="text-[10px] text-slate-700">Tel: {data.storePhone}</p>
              {data.rcNumber && <p className="text-[10px] text-slate-700">{data.rcNumber}</p>}
            </div>

            <div className="border-t border-dashed border-slate-800 my-1.5" />

            {/* Transaction Header */}
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>INV NO:</span>
                <span className="font-bold">{data.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE :</span>
                <span>{data.date}</span>
              </div>
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span>{data.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span className="font-bold">{data.customerName}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-800 my-1.5" />

            {/* Items Table */}
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-dashed border-slate-800">
                  <th className="py-1 uppercase">ITEM</th>
                  <th className="py-1 text-center uppercase">QTY</th>
                  <th className="py-1 text-right uppercase">TOTAL (₦)</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="py-1 pr-1 font-bold">
                      {item.name}
                      {viewMode === "detailed" && (
                        <div className="font-normal text-[9px] text-slate-600">
                          @{formatCurrency(item.unit_price)} / {item.unit_name}
                        </div>
                      )}
                    </td>
                    <td className="py-1 text-center font-bold shrink-0 whitespace-nowrap">
                      {item.quantity} {item.unit_name.toUpperCase()}
                    </td>
                    <td className="py-1 text-right font-bold whitespace-nowrap">
                      {formatCurrency(item.total).replace("₦", "")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-slate-800 my-1.5" />

            {/* Totals Section */}
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>{formatCurrency(data.subtotal)}</span>
              </div>
              {data.discount > 0 && (
                <div className="flex justify-between">
                  <span>DISCOUNT:</span>
                  <span>-{formatCurrency(data.discount)}</span>
                </div>
              )}
              {viewMode === "detailed" && data.tax > 0 && (
                <div className="flex justify-between">
                  <span>VAT / TAX:</span>
                  <span>+{formatCurrency(data.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-black pt-1 border-t border-slate-800">
                <span>TOTAL:</span>
                <span>{formatCurrency(data.total)}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span>PAID AMOUNT:</span>
                <span>{formatCurrency(data.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>CHANGE / BALANCE:</span>
                <span>
                  {data.balanceDue > 0 ? (
                    <span className="text-rose-700">
                      {formatCurrency(data.balanceDue)} (Due)
                    </span>
                  ) : (
                    <span className="text-emerald-700">
                      {formatCurrency(data.change)} (Fully Paid)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span>PAY METHOD:</span>
                <span className="font-bold uppercase">{data.paymentMethod}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-800 my-1.5" />

            {/* Footer Greetings & Authentic Barcode + QR Code */}
            <div className="text-center space-y-1 pt-1">
              <p className="font-bold text-[10px]">=== THANK YOU ===</p>
              <p className="font-bold text-[10px]">PLEASE VISIT AGAIN</p>

              {/* QR Code */}
              <div className="py-1 flex justify-center">
                <ReceiptQRCode value={`https://farama.store/receipt/${data.receiptNumber}`} size={90} />
              </div>

              {/* Authentic Barcode */}
              <div className="py-0.5 flex justify-center">
                <Barcode value={data.receiptNumber} height={36} width={1.4} fontSize={9} />
              </div>

              {/* Social Handle */}
              {data.socialHandle && (
                <p className="text-[9px] text-slate-600 font-sans">{data.socialHandle}</p>
              )}

              {/* Footer Note */}
              <p className="text-[9px] text-slate-700 pt-1 leading-snug font-sans">
                {data.footerText}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center gap-3 pt-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Thermal Receipt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Configuration Modal */}
      <ReceiptConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

      {/* Direct ESC/POS Web Serial Thermal Printing Modal */}
      <ThermalPrintingModal
        sale={sale}
        isOpen={isThermalPrintingOpen}
        onClose={() => setIsThermalPrintingOpen(false)}
        autoStartPrint={true}
      />
    </>
  );
};

export default Receipt;
