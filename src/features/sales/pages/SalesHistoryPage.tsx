import { useState } from "react";
import { useSales, useRefundSale, useSalesStats } from "../hooks/useSales";
import SalesHistory from "../components/sales-history/SalesHistory";
import SaleDetails from "../components/sales-history/SaleDetails";
import OutstandingDebtsWidget from "../components/sales-history/OutstandingDebtsWidget";
import Receipt from "../components/receipt/Receipt";
import type { Sale } from "../types/sale";
import { formatCurrency } from "../utils/pricing";
import { useTheme } from "../../../context/useThems";
import { Sun, Moon } from "lucide-react";

export const SalesHistoryPage = () => {
  const { effectiveTheme, toggleTheme } = useTheme();
  const { data: sales = [], isLoading } = useSales();
  const { data: stats } = useSalesStats();
  const refundMutation = useRefundSale();

  const [selectedSaleDetails, setSelectedSaleDetails] = useState<Sale | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSaleReceipt, setSelectedSaleReceipt] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const handleRefund = async (saleId: string) => {
    if (confirm("Are you sure you want to process a full refund for this sale?")) {
      await refundMutation.mutateAsync(saleId);
      if (isDetailsOpen) setIsDetailsOpen(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sales & Order History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View all historic customer POS transactions, receipts, and process refunds.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-2 text-xs font-bold shadow-2xs cursor-pointer"
          title="Toggle Dark Mode"
        >
          {effectiveTheme === "dark" ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block">Total Transactions</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{stats.totalSales}</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block">Total Revenue</span>
            <span className="text-lg font-black text-blue-600 dark:text-blue-400">{formatCurrency(stats.totalRevenue)}</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block">Net Profit</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.netProfit)}</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block">Refunded Count</span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">{stats.refundedSalesCount}</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 block">Customer Debt</span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">{formatCurrency(stats.totalOutstandingBalance || 0)}</span>
          </div>
        </div>
      )}

      <OutstandingDebtsWidget
        sales={sales}
        isLoading={isLoading}
        onSelectSale={(sale) => {
          setSelectedSaleDetails(sale);
          setIsDetailsOpen(true);
        }}
      />

      <SalesHistory
        sales={sales}
        isLoading={isLoading}
        onSelectSale={(sale) => {
          setSelectedSaleDetails(sale);
          setIsDetailsOpen(true);
        }}
        onOpenReceipt={(sale) => {
          setSelectedSaleReceipt(sale);
          setIsReceiptOpen(true);
        }}
        onRefundSale={handleRefund}
      />

      {selectedSaleDetails && (
        <SaleDetails
          sale={selectedSaleDetails}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedSaleDetails(null);
          }}
          onOpenReceipt={(s) => {
            setIsDetailsOpen(false);
            setSelectedSaleDetails(null);
            setSelectedSaleReceipt(s);
            setIsReceiptOpen(true);
          }}
          onRefundSale={handleRefund}
          isRefunding={refundMutation.isPending}
        />
      )}

      {selectedSaleReceipt && (
        <Receipt
          sale={selectedSaleReceipt}
          isOpen={isReceiptOpen}
          onClose={() => {
            setIsReceiptOpen(false);
            setSelectedSaleReceipt(null);
          }}
        />
      )}
    </div>
  );
};

export default SalesHistoryPage;
