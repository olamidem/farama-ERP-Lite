import { cn } from "../../../utils/cn";
import { USER_STATUS } from "../../auth/types/enums";
import type { UserStatus } from "../../auth/types/enums";

interface StaffStatusBadgeProps {
  status: UserStatus;
}

export const StaffStatusBadge = ({ status }: StaffStatusBadgeProps) => {
  const isInvited = status === USER_STATUS.INVITED;
  const isActive = status === USER_STATUS.ACTIVE;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
        isInvited
          ? "bg-amber-50 text-amber-700 border border-amber-100"
          : isActive
          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
          : "bg-rose-50 text-rose-700 border border-rose-100"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          isInvited
            ? "bg-amber-500 animate-pulse"
            : isActive
            ? "bg-emerald-500 animate-pulse"
            : "bg-rose-500"
        )}
      />
      {isInvited ? "invited" : isActive ? "active" : "suspended"}
    </span>
  );
};
