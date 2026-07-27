import {
  Eye,
  Pencil,
  Key,
  UserX,
  UserCheck,
  Trash2,
  Send,
  ShieldAlert,
} from "lucide-react";
import { cn } from "../../../utils/cn";
import { USER_STATUS } from "../../auth/types/enums";
import type { Employee } from "../types/staff";

interface StaffActionsProps {
  employee: Employee;
  isSelf: boolean;
  onView: () => void;
  onEdit: () => void;
  onResetPin: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onResendInvitation: () => void;
  onResetPassword: () => void;
}

export const StaffActions = ({
  employee,
  isSelf,
  onView,
  onEdit,
  onResetPin,
  onToggleStatus,
  onDelete,
  onResendInvitation,
  onResetPassword,
}: StaffActionsProps) => {
  const isInvited = employee.status === USER_STATUS.INVITED;
  const isActive = employee.status === USER_STATUS.ACTIVE;

  return (
    <div className="flex items-center justify-end gap-2">
      {/* View button */}
      <button
        onClick={onView}
        type="button"
        title="View staff profile details"
        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition cursor-pointer border border-transparent hover:border-emerald-100"
      >
        <Eye size={13} />
      </button>

      {/* Edit button */}
      <button
        onClick={onEdit}
        type="button"
        title="Edit staff operator profile"
        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer border border-transparent hover:border-amber-100"
      >
        <Pencil size={13} />
      </button>

      {isInvited ? (
        /* Resend Invitation button */
        <button
          onClick={onResendInvitation}
          type="button"
          title="Resend invitation link"
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer border border-transparent hover:border-blue-100"
        >
          <Send size={13} />
        </button>
      ) : (
        <>
          <button
            onClick={onResetPassword}
            type="button"
            title="Send password reset email"
            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition cursor-pointer border border-transparent hover:border-purple-100"
          >
            <ShieldAlert size={13} />
          </button>

          <button
            onClick={onResetPin}
            type="button"
            title="Reset terminal access PIN"
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer border border-transparent hover:border-indigo-100"
          >
            <Key size={13} />
          </button>
        </>
      )}

      {/* Toggle Status / Lock Account button */}
      {!isInvited && (
        <button
          disabled={isSelf}
          type="button"
          onClick={onToggleStatus}
          title={
            isActive
              ? "Suspend operator terminal access"
              : "Activate operator terminal access"
          }
          className={cn(
            "p-2 rounded-xl transition cursor-pointer border border-transparent disabled:opacity-40 disabled:cursor-not-allowed",
            isActive
              ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100"
              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100",
          )}
        >
          {isActive ? <UserX size={13} /> : <UserCheck size={13} />}
        </button>
      )}

      {/* Delete button */}
      <button
        disabled={isSelf}
        type="button"
        onClick={onDelete}
        title="Delete staff account"
        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-transparent hover:border-rose-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};
