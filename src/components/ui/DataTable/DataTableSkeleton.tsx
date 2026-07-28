interface DataTableSkeletonProps {
  rows?: number;
  columns?: number;
}

const DataTableSkeleton = ({
  rows = 6,
  columns = 7,
}: DataTableSkeletonProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="min-w-full">
        {/* Header */}
        <thead className="bg-slate-50 dark:bg-slate-800/80">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-4">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {Array.from({ length: rows }).map((_, row) => (
            <tr key={row}>
              {Array.from({ length: columns }).map((_, col) => (
                <td key={col} className="px-6 py-5">
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTableSkeleton;
