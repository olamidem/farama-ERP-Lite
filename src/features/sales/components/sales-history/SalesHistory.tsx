import { useState, useMemo } from "react";
import {
  Search,
  Receipt,
  RotateCcw,
  Calendar,
} from "lucide-react";
import type { Sale } from "../../types/sale";
import { formatCurrency } from "../../utils/pricing";
import { PAYMENT_METHOD_DETAILS } from "../../constants";
import Pagination from "../../../../components/ui/pagination/Pagination";

interface SalesHistoryProps {
  sales: Sale[];
  isLoading?: boolean;
  onSelectSale: (sale: Sale) => void;
  onOpenReceipt: (sale: Sale) => void;
  onRefundSale: (saleId: string) => void;
}

export const SalesHistory = ({
  sales,
  isLoading,
  onSelectSale,
  onOpenReceipt,
  onRefundSale,
}: SalesHistoryProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter Sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchSearch =
        s.sale_number.toLowerCase().includes(search.toLowerCase()) ||
        s.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        (s.customer_phone && s.customer_phone.includes(search));

      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchPayment = paymentFilter === "all" || s.payment_method === paymentFilter;

      let matchDate = true;
      if (startDate) {
        matchDate = matchDate && new Date(s.created_at) >= new Date(startDate);
      }
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        matchDate = matchDate && new Date(s.created_at) <= eDate;
      }

      return matchSearch && matchStatus && matchPayment && matchDate;
    });
  }, [sales, search, statusFilter, paymentFilter, startDate, endDate]);

  const paginatedSales = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSales.slice(start, start + pageSize);
  }, [filteredSales, page, pageSize]);

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by sale #, customer name or phone..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
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

          {(startDate || endDate || search || statusFilter !== "all" || paymentFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setPaymentFilter("all");
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
              className="text-xs text-rose-600 hover:underline font-medium ml-auto"
            >
              Reset Filters
            </button>
          )}
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
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Loading sales transactions...
                  </td>
                </tr>
              ) : paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No transactions matched your current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => {
                  const payDetail =
                    PAYMENT_METHOD_DETAILS[sale.payment_method] ||
                    PAYMENT_METHOD_DETAILS.CASH;

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
                        {formatCurrency(sale.payable_amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            sale.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenReceipt(sale)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-blue-950/40 transition-colors"
                            title="Receipt"
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
    </div>
  );
};

export default SalesHistory;
