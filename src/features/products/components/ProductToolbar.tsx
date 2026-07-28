import React from "react";
import { Download, ChevronDown, Search } from "lucide-react";
import Select from "../../../components/ui/Select";
import type { Category } from "../../categories/types/category";

interface ProductToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  status: string;
  stockStatus: string;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onStockStatusChange: (value: string) => void;
  categories: Category[];
  exportMenu?: React.ReactNode;
}

const ProductToolbar = ({
  search,
  onSearchChange,
  category,
  status,
  stockStatus,
  onCategoryChange,
  onStatusChange,
  onStockStatusChange,
  categories,
  exportMenu,
}: ProductToolbarProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between transition-colors">
      {/* Left Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search bar */}
        <div className="relative w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-full pl-9 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="w-48">
          <Select
            placeholder="All Categories"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            options={categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
            className="h-9 text-xs"
          />
        </div>

        <div className="w-36">
          <Select
            placeholder=""
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            options={[
              { label: "All Status", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            className="h-9 text-xs"
          />
        </div>

        <div className="w-40">
          <Select
            placeholder=""
            value={stockStatus}
            onChange={(e) => onStockStatusChange(e.target.value)}
            options={[
              { label: "Stock Status", value: "all" },
              { label: "In Stock", value: "in_stock" },
              { label: "Low Stock", value: "low_stock" },
              { label: "Out of Stock", value: "out_of_stock" },
            ]}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 self-end lg:self-auto">
        {exportMenu || (
          <button className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-sm">
            <Download size={14} className="text-slate-500" />
            <span>Export</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductToolbar;
