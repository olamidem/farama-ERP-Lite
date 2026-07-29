import { cn } from "../../../utils/cn";

interface StaffStatusBadgeProps {
  status: string;
}

export const StaffStatusBadge = ({ status }: StaffStatusBadgeProps) => {
  const normalized = (status || "").toString().toLowerCase();
  const isActive = normalized === "active";
  const isInvited = normalized === "invited" || normalized === "pending";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
        isActive
          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800"
          : isInvited
          ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800"
          : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-800"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          isActive
            ? "bg-emerald-500 animate-pulse"
            : isInvited
            ? "bg-amber-500"
            : "bg-rose-500"
        )}
      />
      {status}
    </span>
  );
};
