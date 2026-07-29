import { Users, Search, Plus, FileSpreadsheet, ArrowDownLeft, ArrowUpRight, Wallet, Edit2, Trash2 } from "lucide-react";
import type { Customer } from "../types/customer";
import Pagination from "../../../components/ui/pagination/Pagination";

interface CustomerListTableProps {
  customers: Customer[];
  filteredCustomers: Customer[];
  paginatedCustomers: Customer[];
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  activeCustomerId: string | null;
  onSelectCustomer: (id: string) => void;
  onNewCustomer: () => void;
  onExportExcel: () => void;
  onDeposit: (cust: Customer) => void;
  onWithdraw: (cust: Customer) => void;
  onStatement: (cust: Customer) => void;
  onEdit: (cust: Customer) => void;
  onDelete: (cust: Customer) => void;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function CustomerListTable({
  filteredCustomers,
  paginatedCustomers,
  isLoading,
  search,
  onSearchChange,
  activeCustomerId,
  onSelectCustomer,
  onNewCustomer,
  onExportExcel,
  onDeposit,
  onWithdraw,
  onStatement,
  onEdit,
  onDelete,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: CustomerListTableProps) {
  return (
    <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden flex flex-col">
      {/* Search Bar & Actions Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search registered customers by name, phone, or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNewCustomer}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider cursor-pointer shadow-xs transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Customer</span>
          </button>

          <button
            onClick={onExportExcel}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold text-[10px] uppercase tracking-wider cursor-pointer shadow-xs transition"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Table list */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 animate-spin border-4 border-indigo-600 border-t-transparent rounded-full" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">
            Retrieving Ledger balances...
          </span>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="p-16 text-center max-w-sm mx-auto space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">
              No Records Found
            </h4>
            <p className="text-[10px] font-bold text-slate-400 leading-normal mt-1">
              Check your search query or add a brand new customer wallet account.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/40 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left select-none">
                <th className="py-4 px-5">Customer</th>
                <th className="py-4 px-5">Wallet Bal</th>
                <th className="py-4 px-5">Outstanding</th>
                <th className="py-4 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {paginatedCustomers.map((cust) => {
                const isSelected = activeCustomerId === cust.id;
                const isWalkIn = cust.id === "walk-in-customer-id";

                return (
                  <tr
                    key={cust.id}
                    onClick={() => onSelectCustomer(cust.id)}
                    className={`transition hover:bg-slate-50/70 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/30 font-bold border-l-2 border-indigo-600"
                        : ""
                    }`}
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full border text-[10px] font-black flex items-center justify-center uppercase select-none ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          {cust.name.substring(0, 2)}
                        </div>
                        <div>
                          <span className="block font-black text-slate-800">
                            {cust.name}
                          </span>
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {cust.phone || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      {(cust.wallet_balance || 0) > 0 ? (
                        <span className="font-extrabold text-indigo-600">
                          ₦
                          {Number(cust.wallet_balance || 0).toLocaleString(
                            "en-US",
                            { minimumFractionDigits: 2 },
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold">
                          ₦0.00
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      {(cust.outstanding_debt || 0) > 0 ? (
                        <span className="font-extrabold text-rose-600">
                          ₦
                          {Number(cust.outstanding_debt || 0).toLocaleString(
                            "en-US",
                            { minimumFractionDigits: 2 },
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold">
                          ₦0.00
                        </span>
                      )}
                    </td>

                    <td
                      className="py-4 px-5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeposit(cust);
                          }}
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1 px-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider cursor-pointer shadow-xs transition"
                          title="Deposit Funds to Wallet"
                        >
                          <ArrowDownLeft className="h-3 w-3 shrink-0" />
                          <span>Deposit</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onWithdraw(cust);
                          }}
                          className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 py-1 px-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider cursor-pointer transition"
                          title="Withdraw Funds from Wallet"
                        >
                          <ArrowUpRight className="h-3 w-3 shrink-0" />
                          <span>Withdraw</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatement(cust);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition cursor-pointer"
                          title="Print Wallet Statement"
                        >
                          <Wallet className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isWalkIn) return;
                            onEdit(cust);
                          }}
                          disabled={isWalkIn}
                          className={`p-1.5 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition cursor-pointer ${
                            isWalkIn
                              ? "text-slate-200 border-none hover:bg-transparent"
                              : "text-slate-400 hover:text-slate-700"
                          }`}
                          title="Edit Profile"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isWalkIn) return;
                            onDelete(cust);
                          }}
                          disabled={isWalkIn}
                          className={`p-1.5 rounded-lg border border-slate-200/50 hover:bg-rose-50 transition cursor-pointer ${
                            isWalkIn
                              ? "text-slate-200 border-none hover:bg-transparent"
                              : "text-rose-400 hover:text-rose-600"
                          }`}
                          title="Delete Profile"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {filteredCustomers.length > 0 && !isLoading && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/20">
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={filteredCustomers.length}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            itemName="accounts"
          />
        </div>
      )}
    </div>
  );
}
