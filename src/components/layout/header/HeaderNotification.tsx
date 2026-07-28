import { Bell } from "lucide-react";

export const HeaderNotification = () => {
  return (
    <button
      type="button"
      title="Notifications"
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
      aria-label="Notifications"
    >
      <Bell size={16} />
      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
        3
      </span>
    </button>
  );
};
