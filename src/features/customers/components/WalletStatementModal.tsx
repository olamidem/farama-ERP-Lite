import { useState, useMemo } from "react";
import {
  X,
  Printer,
  FileSpreadsheet,
  Wallet,
  AlertCircle,
} from "lucide-react";
import type { Customer } from "../types/customer";
import { useWalletTransactions } from "../hooks/useCustomerWallet";
import { useCustomerSales } from "../hooks/useCustomerSales";
import { useCustomerDebt } from "../hooks/useCustomerDebt";
import { formatNaira } from "../lib/customerExport";

interface WalletStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export default function WalletStatementModal({
  isOpen,
  onClose,
  customer,
}: WalletStatementModalProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"ALL" | "WALLET" | "PURCHASES" | "DEBT">("ALL");

  const { data: transactions = [] } = useWalletTransactions(customer?.id);
  const { data: sales = [] } = useCustomerSales(customer?.id || null);
  const { data: debtData } = useCustomerDebt(customer?.id || null);

  // Financial Metrics
  const walletBalance = customer?.wallet_balance ?? 0;
  const outstandingDebt = debtData?.outstanding_debt ?? customer?.outstanding_debt ?? 0;

  const totalPurchasesVolume = useMemo(() => {
    return sales.reduce(
      (sum, s) => sum + Number(s.payable_amount || s.total_amount || 0),
      0
    );
  }, [sales]);

  // Filtered Wallet Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.created_at);
      if (startDate && txDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (txDate > end) return false;
      }
      return true;
    });
  }, [transactions, startDate, endDate]);

  // Filtered Sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const sDate = new Date(s.created_at);
      if (startDate && sDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (sDate > end) return false;
      }
      return true;
    });
  }, [sales, startDate, endDate]);

  if (!isOpen || !customer) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Type", "Reference", "Description", "Amount (NGN)", "Balance/Debt After", "Status"];
    const rows: string[][] = [];

    // Wallet rows
    filteredTransactions.forEach((tx) => {
      const isCredit = (tx.direction || "").toUpperCase() === "CREDIT";
      rows.push([
        new Date(tx.created_at).toLocaleString("en-NG"),
        "WALLET_" + tx.type.toUpperCase(),
        tx.reference,
        `"${(tx.notes || tx.type).replace(/"/g, '""')}"`,
        `${isCredit ? "+" : "-"}${tx.amount}`,
        `Wallet Bal: ${tx.balance_after}`,
        "COMPLETED",
      ]);
    });

    // Sales rows
    filteredSales.forEach((s) => {
      const payable = Number(s.payable_amount || s.total_amount || 0);
      const paid = Number(s.amount_paid ?? payable);
      const debt = Math.max(0, payable - paid);
      rows.push([
        new Date(s.created_at).toLocaleString("en-NG"),
        "POS_SALE",
        s.sale_number || s.id.slice(0, 8),
        `"Purchase (${s.items?.length || 0} items)"`,
        `-${payable}`,
        debt > 0 ? `Unpaid Debt: ${debt}` : "PAID",
        debt > 0 ? "PARTIAL/CREDIT" : "PAID",
      ]);
    });

    // Sort by date
    rows.sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Financial_Statement_${customer.name.replace(/\s+/g, "_")}_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-5xl w-full my-8 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Modal Toolbar (hidden on print) */}
        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-900 text-white print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-indigo-600 text-white">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">
                Comprehensive Customer Financial Statement
              </h3>
              <p className="text-[10px] text-slate-400 font-bold">
                Customer: {customer.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Statement</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="text-slate-400 hover:text-white p-1.5 rounded-xl transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Statement Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0 print:overflow-visible">
          {/* Header & Date Range Selector */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                FARAMA STORE POS
              </h1>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Official Financial Situation & Account Statement
              </p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <div className="space-y-0.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Customer Particulars & Key Financial Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Account Holder Profile
              </span>
              <p className="text-lg font-black text-slate-900 dark:text-slate-100">{customer.name}</p>
              {customer.phone && <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Phone: {customer.phone}</p>}
              {customer.email && <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Email: {customer.email}</p>}
              {customer.address && <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Address: {customer.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  Wallet Balance
                </span>
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono block mt-1">
                  {formatNaira(walletBalance)}
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[9px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-widest block">
                  Outstanding Debt
                </span>
                <span className={`text-base font-black font-mono block mt-1 ${
                  outstandingDebt > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                }`}>
                  {formatNaira(outstandingDebt)}
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  Total Purchases
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono block mt-1">
                  {formatNaira(totalPurchasesVolume)}
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  Net Balance Position
                </span>
                <span className={`text-base font-black font-mono block mt-1 ${
                  walletBalance - outstandingDebt >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}>
                  {formatNaira(walletBalance - outstandingDebt)}
                </span>
              </div>
            </div>
          </div>

          {/* Statement View Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 print:hidden overflow-x-auto">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === "ALL"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All Transactions ({filteredTransactions.length + filteredSales.length})
            </button>
            <button
              onClick={() => setActiveTab("WALLET")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === "WALLET"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Wallet Transactions ({filteredTransactions.length})
            </button>
            <button
              onClick={() => setActiveTab("PURCHASES")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === "PURCHASES"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Purchases History ({filteredSales.length})
            </button>
            <button
              onClick={() => setActiveTab("DEBT")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === "DEBT"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Unpaid Credit Debts ({debtData?.unpaid_sales.length || 0})
            </button>
          </div>

          {/* Statement Detailed Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {activeTab === "ALL" && "Unified Ledger Statement"}
              {activeTab === "WALLET" && "Wallet Deposit & Withdrawal History"}
              {activeTab === "PURCHASES" && "POS Store Purchase Invoices"}
              {activeTab === "DEBT" && "Outstanding Unpaid Credit Sales"}
            </h3>

            {(activeTab === "WALLET" || activeTab === "ALL") && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3 text-right">Amount (₦)</th>
                      <th className="p-3 text-right">Wallet Balance</th>
                      <th className="p-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400 dark:text-slate-500 font-bold">
                          No wallet transactions found.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const isCredit = (tx.direction || "").toUpperCase() === "CREDIT";
                        const txType = (tx.type || "").toUpperCase();
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <td className="p-3 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                              {new Date(tx.created_at).toLocaleString("en-NG", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                              {tx.reference}
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  txType === "DEPOSIT"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                                    : txType === "WITHDRAWAL"
                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                                    : txType === "SALE_PAYMENT"
                                    ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300"
                                    : "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                }`}
                              >
                                {tx.type.replace("_", " ")}
                              </span>
                            </td>
                            <td className="p-3 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
                              {tx.payment_method.replace("_", " ")}
                            </td>
                            <td
                              className={`p-3 text-right font-black font-mono ${
                                isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {isCredit ? "+" : "-"}{formatNaira(tx.amount)}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                              {formatNaira(tx.balance_after)}
                            </td>
                            <td className="p-3 text-slate-500 dark:text-slate-400 max-w-xs truncate text-[11px]">
                              {tx.notes || "—"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {(activeTab === "PURCHASES" || activeTab === "DEBT" || activeTab === "ALL") && (
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Store Sales & Invoice Breakdown
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        <th className="p-3">Date</th>
                        <th className="p-3">Receipt / Invoice #</th>
                        <th className="p-3">Payment Method</th>
                        <th className="p-3 text-right">Total Amount (₦)</th>
                        <th className="p-3 text-right">Amount Paid (₦)</th>
                        <th className="p-3 text-right">Unpaid Debt (₦)</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {(activeTab === "DEBT" ? debtData?.unpaid_sales || [] : filteredSales).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-400 dark:text-slate-500 font-bold">
                            No sales records found for this view.
                          </td>
                        </tr>
                      ) : (
                        (activeTab === "DEBT" ? debtData?.unpaid_sales || [] : filteredSales).map((s) => {
                          const payable = Number(s.payable_amount || s.total_amount || 0);
                          const paid = Number(s.amount_paid ?? payable);
                          const debt = Math.max(0, payable - paid);
                          const isFullyPaid = debt < 0.01;

                          return (
                            <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                              <td className="p-3 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                {new Date(s.created_at).toLocaleString("en-NG", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </td>
                              <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                                {s.sale_number || s.id.slice(0, 8)}
                              </td>
                              <td className="p-3 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
                                {s.payment_method?.replace("_", " ") || "MULTIPLE/CREDIT"}
                              </td>
                              <td className="p-3 text-right font-black font-mono text-slate-900 dark:text-white">
                                {formatNaira(payable)}
                              </td>
                              <td className="p-3 text-right font-black font-mono text-emerald-600 dark:text-emerald-400">
                                {formatNaira(paid)}
                              </td>
                              <td className="p-3 text-right font-black font-mono text-rose-600 dark:text-rose-400">
                                {debt > 0 ? formatNaira(debt) : "₦0.00"}
                              </td>
                              <td className="p-3 text-center">
                                {isFullyPaid ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-black text-[9px] uppercase">
                                    Paid
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-black text-[9px] uppercase inline-flex items-center gap-1">
                                    <AlertCircle className="h-2.5 w-2.5" /> Credit Debt
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Statement Footer */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 space-y-1">
            <p>This statement is generated automatically from Farama Store POS Financial Engine & Wallet Ledger.</p>
            <p>Statement generated on {new Date().toLocaleString("en-NG")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
