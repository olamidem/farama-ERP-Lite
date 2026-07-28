import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  itemName?: string;
}

const Pagination = ({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  itemName = "products",
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  const startRecord = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;

  const endRecord = Math.min(page * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm md:flex-row md:items-center md:justify-between transition-colors">
      {/* Left */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <label
            htmlFor="page-size"
            className="text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            Rows per page
          </label>

          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-1.5 text-sm font-medium outline-none transition focus:border-indigo-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {startRecord}
          </span>{" "}
          –
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {endRecord}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {totalItems}
          </span>{" "}
          {itemName}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-2 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((pageNumber, index) => {
          if (pageNumber === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-9 w-9 items-center justify-center text-sm font-medium text-slate-400 dark:text-slate-500"
              >
                ...
              </span>
            );
          }

          const num = pageNumber as number;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onPageChange(num)}
              className={`h-9 min-w-9 rounded-lg text-sm font-semibold transition ${
                page === num
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {num}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-2 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
