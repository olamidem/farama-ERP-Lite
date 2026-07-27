import { cn } from "../../../utils/cn";

interface StaffStatusBadgeProps {
  status: "active" | "suspended";
}

export const StaffStatusBadge = ({ status }: StaffStatusBadgeProps) => {
  const isActive = status === "active";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
        isActive
          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
          : "bg-rose-50 text-rose-700 border border-rose-100"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
        )}
      />
      {status}
    </span>
  );
};
