import { useMatches } from "@tanstack/react-router";

export default function HeaderTitle() {
  const matches = useMatches();

  // Find the current match that has staticData
  const currentMatch = matches[matches.length - 1];
  const staticData = currentMatch?.staticData as { headerTitle?: string; title?: string; subtitle?: string } | undefined;

  const headerTitle = staticData?.headerTitle || staticData?.title || "App";
  const subtitle = staticData?.subtitle;

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 whitespace-nowrap">
      <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
        {headerTitle}
      </h1>
      {subtitle && (
        <div className="flex items-center gap-2">
          <span className="text-slate-300 dark:text-slate-700 font-bold text-xs hidden sm:inline">/</span>
          <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}
