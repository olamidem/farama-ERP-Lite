import {
  Briefcase,
  Clock,
  History,
  Edit,
  Smartphone,
} from "lucide-react";
import type { Employee } from "../../types/staff";
import { StaffAvatar } from "../StaffAvatar";
import { USER_STATUS } from "../../../auth/types/enums";

interface StaffHeaderProps {
  employee: Employee;
  onEditProfile: () => void;
}

export const StaffHeader = ({
  employee,
  onEditProfile,
}: StaffHeaderProps) => {
  const isSuspended = employee.status === USER_STATUS.SUSPENDED;
  const isInvited = employee.status === USER_STATUS.INVITED;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between shadow-xs gap-6 transition-colors">
      <div className="flex items-center gap-5">
        <div className="relative">
          <StaffAvatar
            employee={employee}
            className="w-20 h-20 text-3xl font-bold bg-indigo-600 text-white shadow-md ring-4 ring-indigo-50 dark:ring-indigo-950/50"
          />
          <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-md border border-slate-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
            <Smartphone size={14} />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{employee.full_name}</h1>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">{employee.role}</p>
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isSuspended
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50"
                  : isInvited
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50"
                  : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSuspended
                    ? "bg-rose-500"
                    : isInvited
                    ? "bg-amber-500"
                    : "bg-emerald-500 animate-pulse"
                }`}
              />
              {isSuspended ? "Suspended" : isInvited ? "Invited" : "Active Operator"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Briefcase size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Employee ID</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{employee.employee_number || "EMP-00001"}</p>
          </div>
        </div>

        <div className="w-px h-10 bg-slate-100 dark:bg-slate-800 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Joined Date</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {employee.joined_at
                ? new Date(employee.joined_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A"}
            </p>
          </div>
        </div>

        <div className="w-px h-10 bg-slate-100 dark:bg-slate-800 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <History size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Last Login</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {employee.last_login
                ? new Date(employee.last_login).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Never"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEditProfile}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-xs shadow-indigo-200 dark:shadow-none cursor-pointer"
          >
            <Edit size={16} />
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};
