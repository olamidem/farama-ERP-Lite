import { Search, SlidersHorizontal, Download, Calendar } from "lucide-react";
import type { Supplier } from "../types/supplier";
import { useSuppliers } from "../hook/usePurchases";

interface PurchaseFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  supplierId: string;
  setSupplierId: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  dateFilter: string;
  setDateFilter: (val: string) => void;
  onFilterClick: () => void;
  onExport?: () => void;
}

export const PurchaseFilters = ({
  search,
  setSearch,
  supplierId,
  setSupplierId,
  status,
  setStatus,
  dateFilter,
  setDateFilter,
  onFilterClick,
  onExport,
}: PurchaseFiltersProps) => {
  const { data: suppliers = [] } = useSuppliers();

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs transition-colors">
      {/* Search & Selectors Group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 flex-1">
        {/* Search Input */}
        <div className="relative col-span-1 sm:col-span-2 xl:col-span-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-slate-500">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search by PO number or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition"
          />
        </div>

        {/* Suppliers Dropdown */}
        <div>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-600 dark:text-slate-200 font-semibold cursor-pointer transition"
          >
            <option value="all">All Suppliers</option>
            {suppliers.map((s: Supplier) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-600 dark:text-slate-200 font-semibold cursor-pointer transition"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="PARTIALLY_RECEIVED">Partially Received</option>
            <option value="RECEIVED">Received</option>
          </select>
        </div>

        {/* Date Filter Dropdown */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Calendar size={14} />
          </span>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-600 dark:text-slate-200 font-semibold cursor-pointer transition appearance-none"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Filter and Export buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
        <button
          onClick={onFilterClick}
          type="button"
          className="flex items-center gap-1.5 px-4.5 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-3xs hover:text-slate-800 dark:hover:text-slate-100 transition"
        >
          <SlidersHorizontal size={13} />
          <span>Filter</span>
        </button>

        <button
          onClick={onExport}
          type="button"
          className="flex items-center gap-1.5 px-4.5 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-3xs hover:text-slate-800 dark:hover:text-slate-100 transition"
        >
          <Download size={13} />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};

export default PurchaseFilters;
