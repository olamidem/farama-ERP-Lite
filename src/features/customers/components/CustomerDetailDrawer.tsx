import {
  Users,
  Edit2,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  History,
  ShoppingBag,
} from "lucide-react";
import type { Customer } from "../types/customer";
import type { CustomerWallet, WalletTransaction } from "../types/wallet";
import type { CustomerSale } from "../hooks/useCustomerSales";

interface CustomerDetailDrawerProps {
  activeCustomer: Customer | null;
  activeWallet?: CustomerWallet | null;
  activeWalletTransactions?: WalletTransaction[];
  activeCustomerSales?: CustomerSale[];
  isLoadingSales: boolean;
  txFilterType: string;
  onTxFilterChange: (type: string) => void;
  onDeselect: () => void;
  onEdit: (cust: Customer) => void;
  onDelete: (cust: Customer) => void;
  onDeposit: (cust: Customer) => void;
  onWithdraw: (cust: Customer) => void;
  onStatement: (cust: Customer) => void;
  onToggleStatus: (customerId: string, newStatus: "active" | "suspended") => void;
}

export default function CustomerDetailDrawer({
  activeCustomer,
  activeWallet,
  activeWalletTransactions = [],
  activeCustomerSales = [],
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
  if (!activeCustomer) {
    return (
      <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-8 py-16 text-center bg-slate-50/20 border-2 border-dashed border-slate-200/60 rounded-3xl m-4 flex flex-col items-center justify-center min-h-[380px]">
          <div className="p-4 bg-slate-100/70 border border-slate-200/30 rounded-2xl text-slate-400/80 mb-4 select-none">
            <Users className="h-8 w-8" />
          </div>
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">
            No Customer Selected
          </h4>
          <p className="text-[10px] font-bold text-slate-400 leading-relaxed mt-2 max-w-[240px] mx-auto">
            Click a row in the registry table to view detailed ledger cards,
            recent store purchases, and wallet transactions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden">
      <div className="flex flex-col h-full animate-fade-in divide-y divide-slate-100">
        {/* Account Header info */}
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block bg-indigo-50 border border-indigo-100 text-indigo-700 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-2 select-none">
                Active Account
              </span>
              <h3 className="text-sm font-black text-slate-800">
                {activeCustomer.name}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              {activeCustomer.id !== "walk-in-customer-id" && (
                <>
                  <button
                    onClick={() => onEdit(activeCustomer)}
                    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition cursor-pointer"
                    title="Edit Profile"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(activeCustomer)}
                    className="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg border border-slate-200/50 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Profile"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              <button
                onClick={onDeselect}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer ml-1"
                title="Deselect Account"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Contact particulars */}
          <div className="space-y-2 text-[10px] text-slate-600 font-bold">
            {activeCustomer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{activeCustomer.phone}</span>
              </div>
            )}
            {activeCustomer.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{activeCustomer.email}</span>
              </div>
            )}
            {activeCustomer.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{activeCustomer.address}</span>
              </div>
            )}
          </div>

          {/* Wallet Status & Quick Actions */}
          <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  Wallet Balance
                </span>
                <span className="block text-base font-black text-indigo-600 font-mono mt-0.5">
                  ₦
                  {Number(
                    activeCustomer.wallet_balance || 0,
                  ).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  Wallet Status
                </span>
                <span
                  className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 ${
                    activeWallet?.status === "suspended"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {activeWallet?.status || "ACTIVE"}
                </span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onDeposit(activeCustomer)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowDownLeft className="h-3.5 w-3.5" />
                <span>Deposit</span>
              </button>

              <button
                type="button"
                onClick={() => onWithdraw(activeCustomer)}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>Withdraw</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onStatement(activeCustomer)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-[9px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Wallet className="h-3 w-3" />
                <span>Statement</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newStatus =
                    activeWallet?.status === "active" ? "suspended" : "active";
                  onToggleStatus(activeCustomer.id, newStatus);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Toggle Status</span>
              </button>
            </div>
          </div>
        </div>

        {/* Wallet Ledger & Immutable Transactions trace */}
        <div className="p-5 flex-1 flex flex-col min-h-[260px]">
          <div className="flex items-center justify-between gap-1.5 mb-3">
            <div className="flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Wallet Transactions Ledger
              </h4>
            </div>
            <span className="text-[9px] font-black text-indigo-600">
              {activeWalletTransactions.length} logs
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-2 no-scrollbar">
            {[
              "ALL",
              "DEPOSIT",
              "WITHDRAWAL",
              "SALE_PAYMENT",
              "REFUND",
            ].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onTxFilterChange(f)}
                className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition shrink-0 cursor-pointer ${
                  txFilterType === f
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>

          {activeWalletTransactions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-100 rounded-2xl bg-slate-50/10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                No Wallet Transactions
              </span>
              <p className="text-[9px] font-bold text-slate-400/80 mt-1 max-w-[160px]">
                Deposits, withdrawals, and POS sales will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {activeWalletTransactions
                .filter(
                  (tx) =>
                    txFilterType === "ALL" || tx.type === txFilterType,
                )
                .map((tx) => {
                  const isCredit = tx.direction === "CREDIT";
                  return (
                    <div
                      key={tx.id}
                      className="p-2.5 border border-slate-100 rounded-xl bg-slate-50/40 text-[10px] flex justify-between items-start gap-2"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block text-[8px] font-black uppercase tracking-widest rounded px-1.5 py-0.2 ${
                              tx.type === "DEPOSIT"
                                ? "bg-emerald-100 text-emerald-800"
                                : tx.type === "WITHDRAWAL"
                                  ? "bg-rose-100 text-rose-800"
                                  : tx.type === "SALE_PAYMENT"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : tx.type === "REFUND"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-slate-200 text-slate-800"
                            }`}
                          >
                            {tx.type.replace("_", " ")}
                          </span>
                          <span className="text-[8px] font-mono text-slate-400">
                            {tx.reference}
                          </span>
                        </div>
                        <p className="font-bold text-slate-700 truncate pr-1">
                          {tx.notes || `${tx.type.toUpperCase()} transaction`}
                        </p>
                        <span className="block text-[8px] text-slate-400 font-medium">
                          {new Date(tx.created_at).toLocaleString("en-NG", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}{" "}
                          • {tx.payment_method.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`block font-black font-mono ${
                            isCredit ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {isCredit ? "+" : "-"}₦
                          {tx.amount.toLocaleString("en-NG", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <span className="block text-[8px] font-mono text-slate-400">
                          Bal: ₦{tx.balance_after.toLocaleString("en-NG")}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Recent Store Purchases trace */}
        <div className="p-5 min-h-[220px]">
          <div className="flex items-center gap-1.5 mb-3">
            <ShoppingBag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Recent Store Purchases
            </h4>
          </div>

          {isLoadingSales ? (
            <div className="animate-pulse space-y-2">
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          ) : activeCustomerSales.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-100 rounded-2xl bg-slate-50/10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                No Purchases Recorded
              </span>
              <p className="text-[9px] font-bold text-slate-400/80 mt-1">
                No store sales logged under this client.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {activeCustomerSales.map((sale: CustomerSale) => (
                <div
                  key={sale.id}
                  className="p-2 border border-slate-100 rounded-xl bg-slate-50/20 text-[10px] flex justify-between items-center"
                >
                  <div>
                    <span className="block font-black text-slate-700">
                      Invoice: #
                      {sale.invoice_number ||
                        sale.id.substring(0, 8).toUpperCase()}
                    </span>
                    <span className="block text-[8px] text-slate-400 font-bold">
                      {sale.created_at || sale.sale_date
                        ? new Date(
                            sale.created_at || sale.sale_date || "",
                          ).toLocaleDateString()
                        : "N/A"}{" "}
                      • {sale.payment_method || "N/A"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block font-black text-slate-800">
                      ₦
                      {Number(sale.total_amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">
                      {sale.status || "Completed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
