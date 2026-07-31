import { useState, useEffect } from "react";
import {
  Printer,
  CheckCircle2,
  X,
  Usb,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Check,
} from "lucide-react";
import type { Sale } from "../../types/sale";
import { formatReceiptData } from "../../utils/receipt";
import { formatCurrency } from "../../utils/pricing";
import { useThermalPrinter } from "../../hooks/useThermalPrinter";
import { thermalPrinter } from "../../services/thermal/escpos-printer";
import { useReceiptStore } from "../../store/receipt.store";

interface ThermalPrintingModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  autoStartPrint?: boolean;
}

export const ThermalPrintingModal = ({
  sale,
  isOpen,
  onClose,
  autoStartPrint = true,
}: ThermalPrintingModalProps) => {
  const [paperWidth, setPaperWidth] = useState<58 | 80>(58);
  const [printSuccess, setPrintSuccess] = useState(false);
  const { markSaleAsPrinted } = useReceiptStore();

  const {
    isSupported,
    isConnected,
    isConnecting,
    isPrinting,
    error,
    connect,
    printReceipt,
    clearError,
  } = useThermalPrinter();

  const data = sale ? formatReceiptData(sale) : null;

  // Auto-initiate thermal print when modal opens and sale is available
  useEffect(() => {
    if (!isOpen || !sale || !data || !autoStartPrint) return;

    let mounted = true;

    const initiatePrint = async () => {
      setPrintSuccess(false);
      clearError();
      if (!thermalPrinter.isConnected()) {
        // Not connected yet, wait for user connection or prompt
        return;
      }

      const success = await printReceipt(
        {
          storeName: data.storeName,
          storeAddress: data.storeAddress,
          storePhone: data.storePhone,
          rcNumber: data.rcNumber,
          receiptNumber: data.receiptNumber,
          date: data.date,
          cashierName: data.cashierName,
          customerName: data.customerName || "Walk-In Customer",
          paymentMethod: data.paymentMethod,
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          tax: data.tax,
          total: data.total,
          amountPaid: data.amountPaid,
          balanceDue: data.balanceDue,
          change: data.change,
          currencySymbol: "₦",
        },
        paperWidth,
      );

      if (mounted && success) {
        setPrintSuccess(true);
        markSaleAsPrinted(sale.id);
        // Auto close after 1.8 seconds on success
        setTimeout(() => {
          if (mounted) onClose();
        }, 1800);
      }
    };

    initiatePrint();

    return () => {
      mounted = false;
    };
  }, [isOpen, sale?.id, autoStartPrint]);

  if (!isOpen || !sale || !data) return null;

  const handleManualPrint = async () => {
    clearError();
    setPrintSuccess(false);

    if (!isConnected) {
      const conn = await connect();
      if (!conn) return;
    }

    const success = await printReceipt(
      {
        storeName: data.storeName,
        storeAddress: data.storeAddress,
        storePhone: data.storePhone,
        rcNumber: data.rcNumber,
        receiptNumber: data.receiptNumber,
        date: data.date,
        cashierName: data.cashierName,
        customerName: data.customerName || "Walk-In Customer",
        paymentMethod: data.paymentMethod,
        items: data.items,
        subtotal: data.subtotal,
        discount: data.discount,
        tax: data.tax,
        total: data.total,
        amountPaid: data.amountPaid,
        balanceDue: data.balanceDue,
        change: data.change,
        currencySymbol: "₦",
      },
      paperWidth,
    );

    if (success) {
      setPrintSuccess(true);
      markSaleAsPrinted(sale.id);
      setTimeout(() => {
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-5 flex flex-col relative overflow-hidden">
        {/* Top Decorative Banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                Thermal POS Receipt
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                #{data.receiptNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Center Banner */}
        <div className="flex flex-col items-center text-center py-4 space-y-3">
          {printSuccess ? (
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : isPrinting ? (
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-lg">
                <Printer className="w-8 h-8 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
              </span>
            </div>
          ) : isConnecting ? (
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
          ) : !isConnected ? (
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 flex items-center justify-center shadow-md">
              <Usb className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md">
              <Sparkles className="w-8 h-8" />
            </div>
          )}

          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
              {printSuccess
                ? "Receipt Printed Successfully!"
                : isPrinting
                  ? "Printing Thermal Receipt..."
                  : isConnecting
                    ? "Connecting Thermal Printer..."
                    : !isConnected
                      ? "Connect Thermal Printer"
                      : "Ready to Print"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              {printSuccess
                ? "Receipt paper has been formatted and cut."
                : isPrinting
                  ? "Transmitting ESC/POS raw command payload to thermal printer..."
                  : isConnecting
                    ? "Establishing Web Serial link with printer..."
                    : !isConnected
                      ? "Please connect your USB or Serial thermal printer to print the receipt."
                      : "Printer connected and ready for printing."}
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div className="flex-1">
              <p className="font-semibold">Printing Notice</p>
              <p className="text-[11px] opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Web Serial Browser Compatibility Check */}
        {!isSupported && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-300 text-xs">
            <p className="font-bold">Browser Compatibility Notice</p>
            <p className="text-[11px] mt-0.5">
              Direct Web Serial USB thermal printing works best in Chrome,
              Microsoft Edge, or Opera.
            </p>
          </div>
        )}

        {/* Receipt Quick Summary Card */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Customer:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {data.customerName}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Payment Method:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
              {data.paymentMethod}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Items:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {data.items.length} items (
              {data.items.reduce((s, i) => s + i.quantity, 0)} units)
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm font-extrabold">
            <span className="text-slate-900 dark:text-white">
              Amount Total:
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 text-base font-black">
              {formatCurrency(data.total)}
            </span>
          </div>
        </div>

        {/* Paper Size Selector */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            Paper Size:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setPaperWidth(58)}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                paperWidth === 58
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              58mm (2-inch)
            </button>
            <button
              type="button"
              onClick={() => setPaperWidth(80)}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                paperWidth === 80
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              80mm (3-inch)
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-2">
          {!isConnected ? (
            <button
              type="button"
              onClick={async () => {
                const conn = await connect();
                if (conn) {
                  handleManualPrint();
                }
              }}
              disabled={isConnecting}
              className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Usb className="w-4 h-4" />
              <span>
                {isConnecting ? "Connecting..." : "Connect USB Printer"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleManualPrint}
              disabled={isPrinting || printSuccess}
              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {printSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Printed</span>
                </>
              ) : isPrinting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending to Printer...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Print Thermal Receipt</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {printSuccess ? "Done" : "Skip"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThermalPrintingModal;
