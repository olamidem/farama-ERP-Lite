import { Search, FolderKanban } from "lucide-react";
import Select from "../../../components/ui/Select";

interface CategoryToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  filterBy: string;
  onFilterByChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
}

export const CategoryToolbar = ({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  filterBy,
  onFilterByChange,
  totalCount,
  filteredCount,
}: CategoryToolbarProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between transition-colors">
      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="w-full sm:w-48">
          <Select
            placeholder="Sort by..."
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            options={[
              { label: "Name (A - Z)", value: "name-asc" },
              { label: "Name (Z - A)", value: "name-desc" },
              { label: "Most Products", value: "products-desc" },
              { label: "Least Products", value: "products-asc" },
            ]}
          />
        </div>

        {/* Filter Dropdown */}
        <div className="w-full sm:w-48">
          <Select
            placeholder="All Categories"
            value={filterBy}
            onChange={(e) => onFilterByChange(e.target.value)}
            options={[
              { label: "With Products Only", value: "has-products" },
              { label: "Empty Categories Only", value: "empty" },
            ]}
          />
        </div>
      </div>

      {/* Item Counter */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 self-start lg:self-auto">
        <FolderKanban
          size={14}
          className="text-slate-400 dark:text-slate-500"
        />
        <span>
          {filteredCount === totalCount
            ? `Total: ${totalCount}`
            : `Showing ${filteredCount} of ${totalCount}`}
        </span>
      </div>
    </div>
  );
};

export default CategoryToolbar;
