import { Search, Plus } from "lucide-react";

interface StaffFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: "all" | "active" | "suspended";
  onStatusFilterChange: (val: "all" | "active" | "suspended") => void;
  onAddClick: () => void;
}

export const StaffFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddClick,
}: StaffFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/15 w-60 transition font-semibold"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            onStatusFilterChange(
              e.target.value as "all" | "active" | "suspended",
            )
          }
          className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="suspended">Suspended Only</option>
        </select>
      </div>

      <button
        onClick={onAddClick}
        type="button"
        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider px-4 py-2.5 shadow-lg shadow-indigo-600/10 cursor-pointer self-start md:self-auto transition"
      >
        <Plus size={14} />
        <span>Add Operator</span>
      </button>
    </div>
  );
};
