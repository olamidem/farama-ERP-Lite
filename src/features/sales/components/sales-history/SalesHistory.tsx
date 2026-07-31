import { useState, useMemo } from "react";
import {
  Search,
  Receipt,
  RotateCcw,
  Calendar,
  Printer,
  Settings,
  AlertCircle,
} from "lucide-react";
import type { Sale } from "../../types/sale";
import { formatCurrency } from "../../utils/pricing";
import { PAYMENT_METHOD_DETAILS } from "../../constants";
import Pagination from "../../../../components/ui/pagination/Pagination";
import PaymentUpdateModal from "../checkout/PaymentUpdateModal";
import { useReceiptStore } from "../../store/receipt.store";
import ReceiptConfigModal from "../receipt/ReceiptConfigModal";

interface SalesHistoryProps {
  sales: Sale[];
  isLoading?: boolean;
  onSelectSale: (sale: Sale) => void;
  onOpenReceipt: (sale: Sale) => void;
  onRefundSale: (saleId: string) => void;
  onUpdatePayment?: (sale: Sale) => void;
}

export const SalesHistory = ({
  sales,
  isLoading,
  onSelectSale,
  onOpenReceipt,
  onRefundSale,
  onUpdatePayment,
}: SalesHistoryProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [unpaidOnly, setUnpaidOnly] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<Sale | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { isSalePrinted } = useReceiptStore();

  // Filter Sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchSearch =
        s.sale_number.toLowerCase().includes(search.toLowerCase()) ||
        (s.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.customer_phone && s.customer_phone.includes(search));

      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchPayment = paymentFilter === "all" || s.payment_method === paymentFilter;

      const paidAmount = Number(s.amount_paid ?? s.payable_amount ?? 0);
      const balance = Math.max(0, Number(s.payable_amount) - paidAmount);
      const matchUnpaid = !unpaidOnly || balance > 0;

      let matchDate = true;
      if (startDate) {
        matchDate = matchDate && new Date(s.created_at) >= new Date(startDate);
      }
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        matchDate = matchDate && new Date(s.created_at) <= eDate;
      }

      return matchSearch && matchStatus && matchPayment && matchUnpaid && matchDate;
    });
  }, [sales, search, statusFilter, paymentFilter, unpaidOnly, startDate, endDate]);

  const paginatedSales = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSales.slice(start, start + pageSize);
  }, [filteredSales, page, pageSize]);

  const handleOpenPaymentModal = (s: Sale) => {
    if (onUpdatePayment) {
      onUpdatePayment(s);
    } else {
      setSelectedSaleForPayment(s);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && search.trim()) {
                  const term = search.trim().toLowerCase().replace(/^#/, "");
                  const matched = sales.find(
                    (s) =>
                      s.sale_number.toLowerCase() === term ||
                      s.sale_number.toLowerCase().replace(/^#/, "") === term ||
                      s.id.toLowerCase() === term
                  );
                  if (matched) {
                    onSelectSale(matched);
                  }
                }
              }}
              placeholder="Search or scan barcode (e.g. #SALE-1001)... [Press Enter to open]"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="all">All Payment Methods</option>
            <option value="CASH">Cash</option>
            <option value="POS">POS / Card</option>
            <option value="TRANSFER">Transfer</option>
            <option value="WALLET">Wallet</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setUnpaidOnly(!unpaidOnly);
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              unpaidOnly
                ? "bg-rose-500 text-white border-rose-600 shadow-2xs"
                : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Unpaid / Partial Only</span>
          </button>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300"
            />
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300"
            />
          </div>

          {(startDate || endDate || search || statusFilter !== "all" || paymentFilter !== "all" || unpaidOnly) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setPaymentFilter("all");
                setUnpaidOnly(false);
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
              className="text-xs text-rose-600 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsConfigOpen(true)}
            className="ml-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5 text-blue-500" />
            <span>POS Printer Settings</span>
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-700 text-slate-500 font-bold uppercase">
                <th className="py-3 px-4">Sale #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Print Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-400">
                    Loading sales transactions...
                  </td>
                </tr>
              ) : paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-400">
                    No transactions matched your current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => {
                  const payDetail =
                    PAYMENT_METHOD_DETAILS[sale.payment_method as keyof typeof PAYMENT_METHOD_DETAILS] ||
                    PAYMENT_METHOD_DETAILS.CASH;

                  const paid = Number(sale.amount_paid ?? sale.payable_amount ?? 0);
                  const payable = Number(sale.payable_amount ?? 0);
                  const balance = Math.max(0, payable - paid);
                  const isPrinted = isSalePrinted(sale.id);

                  return (
                    <tr
                      key={sale.id}
                      onClick={() => onSelectSale(sale)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {sale.sale_number}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {sale.customer_name}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(sale.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${payDetail.badgeBg}`}
                        >
                          {payDetail.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(payable)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(paid)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {balance > 0 ? (
                          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
                            {formatCurrency(balance)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">
                            {formatCurrency(0)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            sale.status === "COMPLETED"
                              ? balance > 0
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                          }`}
                        >
                          {sale.status === "COMPLETED" && balance > 0 ? "PARTIAL" : sale.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isPrinted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <Printer className="w-3 h-3 text-emerald-500" />
                            <span>Printed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <Printer className="w-3 h-3 text-slate-400" />
                            <span>Not Printed</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {balance > 0 && sale.status === "COMPLETED" && (
                            <button
                              type="button"
                              onClick={() => handleOpenPaymentModal(sale)}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs flex items-center gap-1 transition-all"
                              title="Record Payment"
                            >
                              <span className="font-extrabold text-xs">₦</span>
                              <span>Pay</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenReceipt(sale)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-blue-950/40 transition-colors"
                            title={isPrinted ? "Re-print POS Receipt" : "Print POS Receipt"}
                          >
                            <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenReceipt(sale)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-blue-950/40 transition-colors"
                            title="View Receipt Preview"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                          {sale.status === "COMPLETED" && (
                            <button
                              type="button"
                              onClick={() => onRefundSale(sale.id)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-300 dark:hover:bg-rose-950/40 transition-colors"
                              title="Refund Sale"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredSales.length > 0 && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-700">
            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={filteredSales.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemName="sales"
            />
          </div>
        )}
      </div>

      {/* Internal Payment Update Modal if triggered locally */}
      {selectedSaleForPayment && (
        <PaymentUpdateModal
          isOpen={!!selectedSaleForPayment}
          onClose={() => setSelectedSaleForPayment(null)}
          sale={selectedSaleForPayment}
        />
      )}

      {/* POS Receipt Configuration Modal */}
      <ReceiptConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </div>
  );
};

export default SalesHistory;
