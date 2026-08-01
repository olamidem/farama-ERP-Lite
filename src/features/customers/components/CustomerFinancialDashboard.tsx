import { useState } from "react";
import { toast } from "sonner";
import {
  X,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Edit2,
  Trash2,
  Phone,
  Mail,
  ShoppingBag,
  History,
  ShieldAlert,
  Scale,
  CreditCard,
  Eye,
  PieChart,
} from "lucide-react";
import type { Customer } from "../types/customer";
import type {
  CustomerWallet,
  WalletTransaction,
  WalletStatus,
} from "../types/wallet";
import type { Sale } from "../../sales/types/sale";
import { formatNaira } from "../lib/customerExport";
import { getBadgeColorForTransactionType } from "../utils/wallet.utils";
import { useCustomerDebt, useCustomerCreditHistory } from "../hooks/useCustomerDebt";
import CustomerDebtSettleModal from "./CustomerDebtSettleModal";
import CustomerSaleDetailModal from "./CustomerSaleDetailModal";
import ThermalPrintingModal from "../../sales/components/thermal/ThermalPrintingModal";

interface CustomerFinancialDashboardProps {
  activeCustomer: Customer | null;
  activeWallet: CustomerWallet | undefined;
  activeWalletTransactions: WalletTransaction[];
  activeCustomerSales: Sale[];
  isLoadingSales: boolean;
  txFilterType: string;
  onTxFilterChange: (type: string) => void;
  onDeselect?: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onDeposit: (customer: Customer) => void;
  onWithdraw: (customer: Customer) => void;
  onStatement: (customer: Customer) => void;
  onToggleStatus: (customerId: string, status: WalletStatus) => void;
}

export default function CustomerFinancialDashboard({
  activeCustomer,
  activeWallet,
  activeWalletTransactions,
  activeCustomerSales,
  isLoadingSales,
  txFilterType,
  onTxFilterChange,
  onDeselect,
  onEdit,
  onDelete,
  onDeposit,
  onWithdraw,
  onStatement,
  onToggleStatus,
}: CustomerFinancialDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "purchases" | "debits" | "wallet" | "analytics"
  >("purchases");
  const [selectedSaleForDetails, setSelectedSaleForDetails] =
    useState<Sale | null>(null);
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] =
    useState<Sale | null>(null);
  const [isSettleDebtOpen, setIsSettleDebtOpen] = useState(false);

  // Debt query hook & Credit history hook
  const { data: debtData } = useCustomerDebt(activeCustomer?.id || null);
  const { data: creditHistory = [] } = useCustomerCreditHistory(activeCustomer?.id || null);

  if (!activeCustomer) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold shadow-xs">
        Select a customer from the table to view their complete financial
        dashboard, purchase history, and debt balances.
      </div>
    );
  }

  const isWalkIn = activeCustomer.id === "walk-in-customer-id";
  const isSuspended =
    activeWallet?.status === "SUSPENDED" ||
    activeCustomer.status === "SUSPENDED";

  // Financial calculations
  const walletBalance =
    activeWallet?.balance ?? activeCustomer.wallet_balance ?? 0;
  const outstandingDebt =
    debtData?.outstanding_debt ?? activeCustomer.outstanding_debt ?? 0;
  const creditLimit = debtData?.credit_limit ?? 500000;
  const availableCredit =
    debtData?.available_credit ?? Math.max(0, creditLimit - outstandingDebt);
  const creditUsagePercent = Math.min(
    100,
    Math.round((outstandingDebt / creditLimit) * 100),
  );

  // Lifetime sales stats
  const totalLifetimePurchases = activeCustomerSales.reduce(
    (sum, s) => sum + Number(s.payable_amount || s.total_amount || 0),
    0,
  );
  const totalSalesCount = activeCustomerSales.length;
  const averageOrderValue =
    totalSalesCount > 0 ? totalLifetimePurchases / totalSalesCount : 0;

  // Unpaid sales
  const unpaidSales =
    debtData?.unpaid_sales ||
    activeCustomerSales.filter((s) => {
      const payable = Number(s.payable_amount || s.total_amount || 0);
      const paid = Number(s.amount_paid ?? payable);
      return payable - paid > 0.01;
    });

  // Wallet transaction filter
  const filteredTxs = activeWalletTransactions.filter((t) => {
    if (txFilterType === "ALL") return true;
    return (t.type || "").toUpperCase() === txFilterType;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col space-y-5 p-6 transition-colors">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {activeCustomer.name}
            </h2>
            {isWalkIn && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase">
                Guest
              </span>
            )}
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                isSuspended
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300"
              }`}
            >
              {isSuspended ? "SUSPENDED" : "ACTIVE"}
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
            Customer Financial Account • ID: {activeCustomer.id.slice(0, 12)}
          </p>
        </div>

        {onDeselect && (
          <button
            onClick={onDeselect}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer self-end sm:self-auto"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suspended Alert Banner */}
      {isSuspended && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
            <span>
              Account Suspended. Financial transactions and credit sales
              restricted.
            </span>
          </div>
          {!isWalkIn && (
            <button
              onClick={() => onToggleStatus(activeCustomer.id, "ACTIVE")}
              className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] uppercase tracking-wider transition cursor-pointer shrink-0"
            >
              Activate
            </button>
          )}
        </div>
      )}

      {/* 2. Top Financial Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Wallet Balance */}
        <div className="p-4 rounded-2xl bg-indigo-600 text-white space-y-2 shadow-sm shadow-indigo-600/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-200 flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5" />
              Wallet Balance
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (isSuspended) {
                    toast.error("Account suspended. Activate to deposit.");
                    return;
                  }
                  onDeposit(activeCustomer);
                }}
                className="p-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white transition cursor-pointer"
                title="Deposit Funds"
              >
                <ArrowDownLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  if (isSuspended) {
                    toast.error("Account suspended. Activate to withdraw.");
                    return;
                  }
                  onWithdraw(activeCustomer);
                }}
                className="p-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white transition cursor-pointer"
                title="Withdraw Funds"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="text-xl font-black font-mono tracking-tight">
            {formatNaira(walletBalance)}
          </div>
          <div className="text-[10px] font-semibold text-indigo-200">
            Available for instant POS checkout
          </div>
        </div>

        {/* Card 2: Outstanding Debt / Debit */}
        <div
          className={`p-4 rounded-2xl border space-y-2 transition-colors ${
            outstandingDebt > 0
              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60"
              : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Scale className="h-3.5 w-3.5" />
              Outstanding Debt
            </span>
            {outstandingDebt > 0 && (
              <button
                onClick={() => setIsSettleDebtOpen(true)}
                className="px-2 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-extrabold uppercase transition cursor-pointer"
              >
                Settle Debt
              </button>
            )}
          </div>
          <div
            className={`text-xl font-black font-mono tracking-tight ${
              outstandingDebt > 0
                ? "text-amber-900 dark:text-amber-200"
                : "text-slate-800 dark:text-slate-100"
            }`}
          >
            {formatNaira(outstandingDebt)}
          </div>
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{unpaidSales.length} unpaid / partial sale(s)</span>
          </div>
        </div>

        {/* Card 3: Lifetime Purchases */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <ShoppingBag className="h-3.5 w-3.5 text-blue-500" />
              Lifetime Purchases
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {totalSalesCount} orders
            </span>
          </div>
          <div className="text-xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100">
            {formatNaira(totalLifetimePurchases)}
          </div>
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            Avg order: {formatNaira(averageOrderValue)}
          </div>
        </div>

        {/* Card 4: Credit Limit & Availability */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
              Available Credit
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {creditUsagePercent}% Used
            </span>
          </div>
          <div className="text-xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatNaira(availableCredit)}
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  creditUsagePercent > 80
                    ? "bg-rose-500"
                    : creditUsagePercent > 50
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
                style={{ width: `${creditUsagePercent}%` }}
              />
            </div>
            <div className="text-[9px] text-slate-400 font-semibold flex justify-between">
              <span>Limit: {formatNaira(creditLimit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
        {/* Customer Contact Quick Snippet */}
        <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-300 font-semibold text-xs">
          {activeCustomer.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <span>{activeCustomer.phone}</span>
            </div>
          )}
          {activeCustomer.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{activeCustomer.email}</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsSettleDebtOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Settle Debt</span>
          </button>

          <button
            onClick={() => onStatement(activeCustomer)}
            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-500" />
            <span>Statement</span>
          </button>

          {!isWalkIn && (
            <>
              <button
                onClick={() => onEdit(activeCustomer)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => onDelete(activeCustomer)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. Dashboard Multi-Tab Navigation */}
      <div className="border-b border-slate-100 dark:border-slate-800">
        <div className="flex gap-4 -mb-px overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("purchases")}
            className={`flex items-center gap-2 pb-3 px-2 text-xs font-black uppercase border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeSubTab === "purchases"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
                : "border-transparent text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Purchase History ({activeCustomerSales.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("debits")}
            className={`flex items-center gap-2 pb-3 px-2 text-xs font-black uppercase border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeSubTab === "debits"
                ? "border-amber-600 text-amber-600 dark:text-amber-400 font-extrabold"
                : "border-transparent text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <Scale className="h-4 w-4 text-amber-500" />
            <span>Debits & Debt ({unpaidSales.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("wallet")}
            className={`flex items-center gap-2 pb-3 px-2 text-xs font-black uppercase border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeSubTab === "wallet"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
                : "border-transparent text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <Wallet className="h-4 w-4" />
            <span>Wallet Ledger ({activeWalletTransactions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("analytics")}
            className={`flex items-center gap-2 pb-3 px-2 text-xs font-black uppercase border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeSubTab === "analytics"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
                : "border-transparent text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <PieChart className="h-4 w-4" />
            <span>Financial Analytics</span>
          </button>
        </div>
      </div>

      {/* 4. Tab Views */}
      {/* TAB 1: Purchase History */}
      {activeSubTab === "purchases" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              POS Order Records (Click any sale to view line items & receipt)
            </span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {isLoadingSales ? (
              <div className="p-8 text-center text-slate-400 font-bold animate-pulse text-xs">
                Loading purchase records...
              </div>
            ) : activeCustomerSales.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                No past POS purchase records found for this customer.
              </div>
            ) : (
              activeCustomerSales.map((s) => {
                const payable = Number(s.payable_amount || s.total_amount || 0);
                const paid = Number(s.amount_paid ?? payable);
                const balance = Math.max(0, payable - paid);
                const itemsCount = s.items?.length || 0;

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSaleForDetails(s)}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <History className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                          {s.sale_number}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase">
                          {s.payment_method}
                        </span>
                        {balance > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 text-[10px] font-black uppercase">
                            Debt Due: {formatNaira(balance)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-2">
                        <span>{new Date(s.created_at).toLocaleString()}</span>
                        <span>•</span>
                        <span>
                          {itemsCount > 0
                            ? `${itemsCount} item(s)`
                            : "Standard Order"}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="font-mono font-black text-sm text-slate-900 dark:text-white">
                          {formatNaira(payable)}
                        </div>
                        {balance > 0 ? (
                          <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                            Paid: {formatNaira(paid)}
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Fully Paid
                          </div>
                        )}
                      </div>

                      <div className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600">
                        <Eye className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Debits & Debt Settlement */}
      {activeSubTab === "debits" && (
        <div className="space-y-4">
          {/* Debt Summary Banner */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-black text-amber-900 dark:text-amber-200">
                Outstanding Debt Balance: {formatNaira(outstandingDebt)}
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                {unpaidSales.length > 0
                  ? `This customer has ${unpaidSales.length} invoice(s) with unpaid balances.`
                  : "Customer is fully paid with zero outstanding debt."}
              </p>
            </div>
            {outstandingDebt > 0 && (
              <button
                onClick={() => setIsSettleDebtOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-amber-600/20 shrink-0"
              >
                Record Debt Repayment
              </button>
            )}
          </div>

          {/* Unpaid Sales List */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Unpaid Credit Sales ({unpaidSales.length})
            </span>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {unpaidSales.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-bold bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  No pending debts or credit sales for this customer!
                </div>
              ) : (
                unpaidSales.map((s) => {
                  const payable = Number(
                    s.payable_amount || s.total_amount || 0,
                  );
                  const paid = Number(s.amount_paid ?? payable);
                  const due = Math.max(0, payable - paid);

                  return (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <span className="font-mono text-xs text-amber-700 dark:text-amber-300">
                            {s.sale_number}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {new Date(s.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Total: {formatNaira(payable)} | Paid:{" "}
                          {formatNaira(paid)}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-black text-sm text-amber-700 dark:text-amber-300">
                          Due: {formatNaira(due)}
                        </span>
                        <div>
                          <button
                            onClick={() => setIsSettleDebtOpen(true)}
                            className="text-[10px] font-extrabold text-amber-600 hover:underline cursor-pointer"
                          >
                            Pay this invoice →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Credit Transactions & Debt Repayment History */}
          <div className="space-y-2 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Credit & Repayment History ({creditHistory.length})
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Audited ledger from customer_credit_transactions
              </span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {creditHistory.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-bold bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  No credit sales or repayment transactions recorded for this customer.
                </div>
              ) : (
                creditHistory.map((tx) => {
                  const isPayment = tx.transaction_type === "PAYMENT";
                  const isRefund = tx.transaction_type === "REFUND";

                  return (
                    <div
                      key={tx.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition ${
                        isPayment
                          ? "border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20"
                          : isRefund
                          ? "border-sky-200/80 dark:border-sky-900/40 bg-sky-50/40 dark:bg-sky-950/20"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wider ${
                              isPayment
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                : isRefund
                                ? "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800"
                                : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                            }`}
                          >
                            {tx.transaction_type}
                          </span>

                          {tx.payment_method && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                              {tx.payment_method}
                            </span>
                          )}

                          <span className="text-[10px] text-slate-400 font-semibold">
                            {new Date(tx.created_at).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                          {tx.notes || (isPayment ? "Debt repayment" : "Credit debt added")}
                          {tx.sale?.sale_number && (
                            <span className="font-mono text-slate-700 dark:text-slate-300 ml-1">
                              (Sale: #{tx.sale.sale_number})
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono font-black text-sm ${
                            isPayment
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isRefund
                              ? "text-sky-600 dark:text-sky-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {isPayment ? "-" : "+"}{formatNaira(Number(tx.amount || 0))}
                        </span>

                        {tx.performer?.full_name && (
                          <div className="text-[9px] text-slate-400 font-medium mt-0.5">
                            Cashier: {tx.performer.full_name}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Wallet Ledger */}
      {activeSubTab === "wallet" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Ledger Transactions
            </span>
            <select
              value={txFilterType}
              onChange={(e) => onTxFilterChange(e.target.value)}
              className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="DEPOSIT">Deposits</option>
              <option value="WITHDRAWAL">Withdrawals</option>
              <option value="SALE_PAYMENT">POS Sales</option>
              <option value="REFUND">Refunds</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {filteredTxs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-bold bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                No wallet transactions recorded.
              </div>
            ) : (
              filteredTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase ${getBadgeColorForTransactionType(tx.type)}`}
                      >
                        {tx.type}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {tx.reference}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-black text-xs ${
                        tx.direction === "CREDIT"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {tx.direction === "CREDIT" ? "+" : "-"}
                      {formatNaira(tx.amount)}
                    </span>
                    <p className="text-[9px] font-mono text-slate-400 font-bold">
                      Bal: {formatNaira(tx.balance_after)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Financial Analytics */}
      {activeSubTab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase text-slate-400">
                Average Basket Size
              </span>
              <div className="text-base font-black font-mono text-slate-800 dark:text-slate-100 mt-1">
                {formatNaira(averageOrderValue)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase text-slate-400">
                Debt-to-Limit Ratio
              </span>
              <div className="text-base font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                {creditUsagePercent}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase text-slate-400">
                Total Orders Placed
              </span>
              <div className="text-base font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                {totalSalesCount} Order(s)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debt Settle Modal */}
      {isSettleDebtOpen && (
        <CustomerDebtSettleModal
          isOpen={isSettleDebtOpen}
          onClose={() => setIsSettleDebtOpen(false)}
          customer={activeCustomer}
          outstandingDebt={outstandingDebt}
          unpaidSales={unpaidSales}
          walletBalance={walletBalance}
        />
      )}

      {/* Sale Items Detail Modal */}
      {selectedSaleForDetails && (
        <CustomerSaleDetailModal
          sale={selectedSaleForDetails}
          onClose={() => setSelectedSaleForDetails(null)}
          onOpenReceipt={(s) => {
            setSelectedSaleForDetails(null);
            setSelectedSaleForReceipt(s);
          }}
        />
      )}

      {/* Thermal Receipt Print Modal */}
      {selectedSaleForReceipt && (
        <ThermalPrintingModal
          sale={selectedSaleForReceipt}
          isOpen={!!selectedSaleForReceipt}
          onClose={() => setSelectedSaleForReceipt(null)}
        />
      )}
    </div>
  );
}
