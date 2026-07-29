const PurchaseOverviewSkeleton = () => {
  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl flex flex-col w-full animate-pulse transition-colors">
      {/* Top Header Skeleton */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 w-2/3">
          <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* Tabs Row Skeleton */}
      <div className="px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="py-3 border-b-2 border-transparent w-16">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Content Area Skeleton */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Info Grid Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 p-5 space-y-4">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        </div>

        {/* Supplier Box Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 p-5 space-y-3">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          </div>
        </div>

        {/* Remarks Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-150 p-5 space-y-2">
          <div className="h-3 w-16 bg-slate-100 rounded" />
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-3/4 bg-slate-200 rounded" />
        </div>

        {/* Totals Box Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-150 p-5 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-20 bg-slate-200 rounded" />
            <div className="h-4 w-24 bg-slate-200 rounded" />
          </div>
          <div className="h-px bg-slate-100" />
          <div className="flex justify-between">
            <div className="h-5 w-24 bg-slate-200 rounded" />
            <div className="h-5 w-32 bg-slate-300 rounded font-bold" />
          </div>
        </div>
      </div>

      {/* Sticky Action Footer Skeleton */}
      <div className="p-5 bg-white border-t border-slate-200 shrink-0 flex justify-between gap-3">
        <div className="h-10 w-28 bg-slate-200 rounded-xl" />
        <div className="h-10 w-32 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
};

export default PurchaseOverviewSkeleton;
