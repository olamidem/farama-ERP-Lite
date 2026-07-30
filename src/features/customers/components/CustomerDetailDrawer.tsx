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
  MapPin,
  ShoppingBag,
  History,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import type { Customer } from "../types/customer";
import type {
  CustomerWallet,
  WalletTransaction,
  WalletStatus,
} from "../types/wallet";
import type { CustomerSale } from "../hooks/useCustomerSales";
import { formatNaira } from "../lib/customerExport";
import { getBadgeColorForTransactionType } from "../utils/wallet.utils";

interface CustomerDetailDrawerProps {
  activeCustomer: Customer | null;
  activeWallet: CustomerWallet | undefined;
  activeWalletTransactions: WalletTransaction[];
  activeCustomerSales: CustomerSale[];
  isLoadingSales: boolean;
  txFilterType: string;
  onTxFilterChange: (type: string) => void;
  onDeselect: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onDeposit: (customer: Customer) => void;
  onWithdraw: (customer: Customer) => void;
  onStatement: (customer: Customer) => void;
  onToggleStatus: (customerId: string, status: WalletStatus) => void;
}

export default function CustomerDetailDrawer({
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
}: CustomerDetailDrawerProps) {
  const [tab, setTab] = useState<"wallet" | "sales">("wallet");

  if (!activeCustomer) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs font-bold shadow-xs">
        Select a customer from the table to view detailed ledger, transactions,
        and POS purchase history.
      </div>
    );
  }

  const isWalkIn = activeCustomer.id === "walk-in-customer-id";
  const filteredTxs = activeWalletTransactions.filter((t) => {
    if (txFilterType === "ALL") return true;
    return (t.type || "").toUpperCase() === txFilterType;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col space-y-4 p-6">
      {/* Drawer Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-800">
              {activeCustomer.name}
            </h2>
            {isWalkIn && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-black uppercase">
                Guest
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-bold">
            Customer ID: {activeCustomer.id.slice(0, 12)}
          </p>
        </div>
        <button
          onClick={onDeselect}
          className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Suspended Notice Banner */}
      {(activeWallet?.status === "SUSPENDED" ||
        activeCustomer.status === "SUSPENDED") && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
            <span>Account Suspended. Activities disabled.</span>
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

      {/* Info & Wallet Overview Card */}
      <div className="p-5 rounded-2xl bg-indigo-600 text-white space-y-4 shadow-md shadow-indigo-600/10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">
            Ledger Wallet Balance
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
              activeWallet?.status === "SUSPENDED" ||
              activeCustomer.status === "SUSPENDED"
                ? "bg-rose-500 text-rose-100"
                : "bg-indigo-500 text-indigo-100"
            }`}
          >
            {activeWallet?.status || activeCustomer.status || "ACTIVE"}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-black font-mono tracking-tight">
            {formatNaira(activeCustomer.wallet_balance || 0)}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (
                  activeWallet?.status === "SUSPENDED" ||
                  activeCustomer.status === "SUSPENDED"
                ) {
                  toast.error(
                    "Account is suspended. Activate account to deposit funds.",
                  );
                  return;
                }
                onDeposit(activeCustomer);
              }}
              className={`p-2 rounded-xl transition ${
                activeWallet?.status === "SUSPENDED" ||
                activeCustomer.status === "SUSPENDED"
                  ? "bg-indigo-400/40 text-indigo-200 cursor-not-allowed opacity-50"
                  : "bg-indigo-500 hover:bg-indigo-400 text-white cursor-pointer"
              }`}
              title="Deposit Funds"
            >
              <ArrowDownLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (
                  activeWallet?.status === "SUSPENDED" ||
                  activeCustomer.status === "SUSPENDED"
                ) {
                  toast.error(
                    "Account is suspended. Activate account to withdraw funds.",
                  );
                  return;
                }
                onWithdraw(activeCustomer);
              }}
              className={`p-2 rounded-xl transition ${
                activeWallet?.status === "SUSPENDED" ||
                activeCustomer.status === "SUSPENDED"
                  ? "bg-indigo-400/40 text-indigo-200 cursor-not-allowed opacity-50"
                  : "bg-indigo-500 hover:bg-indigo-400 text-white cursor-pointer"
              }`}
              title="Withdraw Funds"
            >
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onStatement(activeCustomer)}
              className="p-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white transition cursor-pointer"
              title="Statement"
            >
              <FileText className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action button bar */}
        {!isWalkIn && (
          <div className="pt-2 border-t border-indigo-500/50 flex items-center justify-between gap-2 text-[10px] font-black uppercase">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(activeCustomer)}
                className="flex items-center gap-1 text-indigo-200 hover:text-white transition cursor-pointer"
              >
                <Edit2 className="h-3 w-3" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => onDelete(activeCustomer)}
                className="flex items-center gap-1 text-rose-300 hover:text-rose-100 transition cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete</span>
              </button>
            </div>

            <button
              onClick={() =>
                onToggleStatus(
                  activeCustomer.id,
                  activeWallet?.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED",
                )
              }
              className="flex items-center gap-1 text-indigo-200 hover:text-white transition cursor-pointer"
            >
              {activeWallet?.status === "SUSPENDED" ? (
                <>
                  <ShieldCheck className="h-3 w-3 text-emerald-300" />
                  <span>Activate</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-3 w-3 text-amber-300" />
                  <span>Suspend</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Customer Contact Quick Info */}
      <div className="space-y-2 text-xs font-semibold text-slate-600 bg-slate-50 p-4 rounded-2xl">
        {activeCustomer.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span>{activeCustomer.phone}</span>
          </div>
        )}
        {activeCustomer.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            <span>{activeCustomer.email}</span>
          </div>
        )}
        {activeCustomer.address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>{activeCustomer.address}</span>
          </div>
        )}
      </div>

      {/* Sub Tabs: Wallet Ledger vs Purchase History */}
      <div className="flex border-b border-slate-100 pt-2">
        <button
          onClick={() => setTab("wallet")}
          className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-black uppercase border-b-2 transition cursor-pointer ${
            tab === "wallet"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Wallet className="h-3.5 w-3.5" />
          <span>Wallet Ledger ({activeWalletTransactions.length})</span>
        </button>
        <button
          onClick={() => setTab("sales")}
          className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-black uppercase border-b-2 transition cursor-pointer ${
            tab === "sales"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>POS Orders ({activeCustomerSales.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {tab === "wallet" ? (
        <div className="space-y-3">
          {/* Filter Dropdown */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Recent Transactions
            </span>
            <select
              value={txFilterType}
              onChange={(e) => onTxFilterChange(e.target.value)}
              className="text-[10px] font-extrabold text-slate-600 bg-slate-100 border border-slate-200/80 rounded-lg px-2 py-1 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="DEPOSIT">Deposits</option>
              <option value="WITHDRAWAL">Withdrawals</option>
              <option value="SALE_PAYMENT">POS Sales</option>
              <option value="REFUND">Refunds</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {filteredTxs.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs font-bold">
                No wallet transactions found.
              </div>
            ) : (
              filteredTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[9px] font-black border uppercase ${getBadgeColorForTransactionType(tx.type)}`}
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
                          ? "text-emerald-600"
                          : "text-rose-600"
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
      ) : (
        <div className="space-y-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            POS Sales History
          </span>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {isLoadingSales ? (
              <div className="p-6 text-center text-slate-400 text-xs font-bold animate-pulse">
                Loading orders...
              </div>
            ) : activeCustomerSales.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs font-bold">
                No past sales records for this customer.
              </div>
            ) : (
              activeCustomerSales.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <History className="h-3.5 w-3.5 text-indigo-500" />
                      <span>
                        {s.invoice_number || `INV-${s.id.slice(0, 6)}`}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {s.created_at
                        ? new Date(s.created_at).toLocaleString()
                        : "Recently"}
                    </p>
                  </div>

                  <div className="text-right font-mono font-bold text-slate-800">
                    {formatNaira(Number(s.total_amount))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
