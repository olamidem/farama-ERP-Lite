import { useState, useMemo } from "react";
import { X, Printer, FileSpreadsheet, Wallet, ShieldCheck } from "lucide-react";
import type { Customer } from "../types/customer";
import { useWalletTransactions } from "../hooks/useCustomerWallet";

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

  const { data: transactions = [] } = useWalletTransactions(customer?.id);

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

  const statementMetrics = useMemo(() => {
    let totalCredits = 0;
    let totalDebits = 0;
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let totalSalePayments = 0;
    let totalRefunds = 0;

    filteredTransactions.forEach((tx) => {
      const isCredit = (tx.direction || "").toUpperCase() === "CREDIT";
      const txType = (tx.type || "").toUpperCase();

      if (isCredit) {
        totalCredits += tx.amount;
        if (txType === "DEPOSIT") totalDeposits += tx.amount;
        if (txType === "REFUND") totalRefunds += tx.amount;
      } else {
        totalDebits += tx.amount;
        if (txType === "WITHDRAWAL") totalWithdrawals += tx.amount;
        if (txType === "SALE_PAYMENT") totalSalePayments += tx.amount;
      }
    });

    return {
      totalCredits,
      totalDebits,
      totalDeposits,
      totalWithdrawals,
      totalSalePayments,
      totalRefunds,
    };
  }, [filteredTransactions]);

  if (!isOpen || !customer) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!filteredTransactions.length) return;
    const headers = ["Date", "Reference", "Type", "Direction", "Method", "Amount", "Balance After", "Notes"];
    const rows = filteredTransactions.map((tx) => [
      new Date(tx.created_at).toLocaleString("en-NG"),
      tx.reference,
      tx.type.toUpperCase(),
      tx.direction.toUpperCase(),
      tx.payment_method.toUpperCase(),
      tx.amount,
      tx.balance_after,
      `"${(tx.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Wallet_Statement_${customer.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Toolbar (hidden on print) */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-900 text-white print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-indigo-600 text-white">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">
                Official Wallet Account Statement
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
              <FileSpreadsheet className="h-3.5 w-3.5" />
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
        <div className="p-8 overflow-y-auto space-y-6 print:p-0 print:overflow-visible">
          {/* Header & Date Range Selector */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
            <div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                FARAMA PHARMACY & STORE
              </h1>
              <p className="text-xs font-bold text-slate-500">
                Official Customer Wallet Statement
              </p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <div className="space-y-0.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Customer Particulars Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Account Holder
              </span>
              <p className="text-base font-black text-slate-900">{customer.name}</p>
              {customer.email && <p className="text-xs font-bold text-slate-600">{customer.email}</p>}
              {customer.phone && <p className="text-xs font-bold text-slate-600">{customer.phone}</p>}
              {customer.address && <p className="text-xs font-medium text-slate-500">{customer.address}</p>}
            </div>
            <div className="space-y-1 md:text-right">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Current Wallet Status
              </span>
              <p className="text-xs font-black text-emerald-600 uppercase tracking-wider flex items-center md:justify-end gap-1">
                <ShieldCheck className="h-4 w-4" /> ACTIVE WALLET
              </p>
              <div className="pt-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                  Current Wallet Balance
                </span>
                <span className="text-lg font-black text-indigo-600 font-mono">
                  ₦{(customer.wallet_balance || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Statement Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest block">
                Total Deposits
              </span>
              <span className="text-sm font-black text-emerald-700 font-mono">
                +₦{statementMetrics.totalDeposits.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-100">
              <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest block">
                Total Withdrawals
              </span>
              <span className="text-sm font-black text-rose-700 font-mono">
                -₦{statementMetrics.totalWithdrawals.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100">
              <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest block">
                POS Wallet Payments
              </span>
              <span className="text-sm font-black text-indigo-700 font-mono">
                -₦{statementMetrics.totalSalePayments.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
              <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest block">
                Refunds Credited
              </span>
              <span className="text-sm font-black text-amber-700 font-mono">
                +₦{statementMetrics.totalRefunds.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Ledger Statement Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Transaction History Statement ({filteredTransactions.length} entries)
            </h3>
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 font-bold text-xs">
                No wallet transactions recorded for the selected date range.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3 text-right">Amount (₦)</th>
                      <th className="p-3 text-right">Balance After</th>
                      <th className="p-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filteredTransactions.map((tx) => {
                      const isCredit = (tx.direction || "").toUpperCase() === "CREDIT";
                      const txType = (tx.type || "").toUpperCase();
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                            {new Date(tx.created_at).toLocaleString("en-NG", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-800">
                            {tx.reference}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                txType === "DEPOSIT"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : txType === "WITHDRAWAL"
                                  ? "bg-rose-100 text-rose-800"
                                  : txType === "SALE_PAYMENT"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : txType === "REFUND"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-200 text-slate-800"
                              }`}
                            >
                              {tx.type.replace("_", " ")}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] font-extrabold uppercase text-slate-500">
                            {tx.payment_method.replace("_", " ")}
                          </td>
                          <td
                            className={`p-3 text-right font-black font-mono ${
                              isCredit ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {isCredit ? "+" : "-"}₦
                            {tx.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-800">
                            ₦{tx.balance_after.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-slate-500 max-w-xs truncate text-[11px]">
                            {tx.notes || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Statement Footer */}
          <div className="pt-6 border-t border-slate-200 text-center text-[10px] font-bold text-slate-400 space-y-1">
            <p>This statement is generated automatically from Farama Store POS Wallet Ledger.</p>
            <p>Statement generated on {new Date().toLocaleString("en-NG")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
