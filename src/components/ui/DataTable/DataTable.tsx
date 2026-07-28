import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
} from "@tanstack/react-table";
import DataTableEmpty from "./DataTableEmpty";
import DataTableSkeleton from "./DataTableSkeleton";
import { Package } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../../utils/cn";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  getRowId?: (originalRow: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  isLoading?: boolean;
  getRowClassName?: (originalRow: T) => string;
}

const DataTable = <T,>({
  data,
  columns,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  emptyTitle,
  emptyDescription,
  isLoading = false,
  getRowClassName,
}: DataTableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (data.length === 0) {
    return (
      <DataTableEmpty
        icon={Package}
        title={emptyTitle ?? "No data found"}
        description={emptyDescription ?? "There is nothing to display yet."}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
      <div className="max-h-150 overflow-y-auto overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="bg-white dark:bg-slate-900">
            {table.getRowModel().rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.18,
                  delay: Math.min(index * 0.02, 0.25),
                }}
                className={cn(
                  "transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  getRowClassName ? getRowClassName(row.original) : "",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-3 align-middle text-sm text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/60"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
