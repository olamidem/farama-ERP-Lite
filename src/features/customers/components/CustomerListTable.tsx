import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  Search,
  Plus,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Edit2,
  Trash2,
  User,
  Wallet,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import type { Customer } from "../types/customer";
import { formatNaira } from "../lib/customerExport";
import DataTable from "../../../components/ui/DataTable/DataTable";
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
  onDeposit: (customer: Customer) => void;
  onWithdraw: (customer: Customer) => void;
  onStatement: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
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
  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Customer",
        cell: ({ row }) => {
          const cust = row.original;
          const isWalkIn = cust.id === "walk-in-customer-id";
          const isSuspended = cust.status === "SUSPENDED";

          return (
            <div
              className="flex items-center gap-3 cursor-pointer py-1"
              onClick={() => onSelectCustomer(cust.id)}
            >
              <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300 font-black text-xs shadow-2xs">
                {isWalkIn ? (
                  <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                ) : (
                  cust.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-2 text-xs">
                  <span>{cust.name}</span>
                  {isWalkIn && (
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-wider">
                      Guest
                    </span>
                  )}
                  {isSuspended && (
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                      <ShieldAlert className="h-2.5 w-2.5" />
                      Suspended
                    </span>
                  )}
                </div>
                {cust.email && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate max-w-[170px]">
                    {cust.email}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "phone",
        header: "Phone / Contact",
        cell: ({ row }) => {
          const cust = row.original;
          return (
            <div
              className="cursor-pointer py-1 font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-300"
              onClick={() => onSelectCustomer(cust.id)}
            >
              <div>{cust.phone || "—"}</div>
              {cust.address && (
                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[150px]">
                  {cust.address}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Account Status",
        cell: ({ row }) => {
          const cust = row.original;
          const isSuspended = cust.status === "SUSPENDED";
          return (
            <div
              className="cursor-pointer py-1"
              onClick={() => onSelectCustomer(cust.id)}
            >
              {isSuspended ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-black text-[10px] uppercase">
                  <ShieldAlert className="h-3 w-3" />
                  Suspended
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 font-black text-[10px] uppercase">
                  <ShieldCheck className="h-3 w-3" />
                  Active
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "wallet_balance",
        header: "Wallet Balance",
        cell: ({ row }) => {
          const cust = row.original;
          return (
            <div
              className="cursor-pointer py-1 text-right font-mono font-bold"
              onClick={() => onSelectCustomer(cust.id)}
            >
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-[11px]">
                <Wallet className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
                {formatNaira(cust.wallet_balance || 0)}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Quick Actions",
        cell: ({ row }) => {
          const cust = row.original;
          const isWalkIn = cust.id === "walk-in-customer-id";
          const isSuspended = cust.status === "SUSPENDED";

          return (
            <div
              className="flex items-center justify-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  if (isSuspended) {
                    toast.error("Account is suspended. Activate account to perform deposits.");
                    return;
                  }
                  onDeposit(cust);
                }}
                disabled={isSuspended}
                title={isSuspended ? "Account suspended" : "Deposit Funds"}
                className={`p-1.5 rounded-lg transition ${
                  isSuspended
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                    : "bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 cursor-pointer"
                }`}
              >
                <ArrowDownLeft className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => {
                  if (isSuspended) {
                    toast.error("Account is suspended. Activate account to perform withdrawals.");
                    return;
                  }
                  onWithdraw(cust);
                }}
                disabled={isSuspended}
                title={isSuspended ? "Account suspended" : "Withdraw Funds"}
                className={`p-1.5 rounded-lg transition ${
                  isSuspended
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                    : "bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400 cursor-pointer"
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => onStatement(cust)}
                title="View Statement"
                className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 transition cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5" />
              </button>

              {!isWalkIn && (
                <>
                  <button
                    onClick={() => onEdit(cust)}
                    title="Edit Customer"
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => onDelete(cust)}
                    title="Delete Customer"
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [onSelectCustomer, onDeposit, onWithdraw, onStatement, onEdit, onDelete]
  );

  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col space-y-4 transition-colors">
      {/* Header Bar */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, phone, email, or address..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/15 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-[10px] uppercase tracking-wider transition cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Excel</span>
          </button>
          <button
            onClick={onNewCustomer}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wider transition cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* DataTable */}
      <div className="px-5">
        <DataTable
          data={paginatedCustomers}
          columns={columns}
          isLoading={isLoading}
          emptyTitle="No customers found"
          emptyDescription="No customer records match your current filter or search query."
          getRowClassName={(row) =>
            row.id === activeCustomerId
              ? "bg-indigo-50/70 dark:bg-indigo-950/60 font-semibold cursor-pointer"
              : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }
        />
      </div>

      {/* Pagination Footer */}
      {!isLoading && filteredCustomers.length > 0 && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={filteredCustomers.length}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            itemName="customers"
          />
        </div>
      )}
    </div>
  );
}
