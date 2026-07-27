import { cn } from "../../../../utils/cn";
import type { Employee } from "../../types/staff";
import { USER_STATUS } from "../../../auth/types/enums";

interface ViewStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export const ViewStaffModal = ({
  isOpen,
  onClose,
  employee,
}: ViewStaffModalProps) => {
  if (!isOpen || !employee) return null;

  return (
    <div id="view-employee-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden text-left">
        <div className="border-b border-slate-50 px-6 py-5 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Employee Details</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-black cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div
              style={{ backgroundColor: employee.avatar_color || undefined }}
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black tracking-widest shadow-md"
            >
              {employee.full_name
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <h4 className="text-base font-black text-slate-800 tracking-tight">
                {employee.full_name}
              </h4>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                {employee.role?.name || "N/A"}
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-50 border-t border-b border-slate-100 py-2 space-y-2.5">
            <div className="flex justify-between py-1.5 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Email Address
              </span>
              <span className="font-semibold text-slate-700">{employee.email}</span>
            </div>
            <div className="flex justify-between py-1.5 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Phone Number
              </span>
              <span className="font-semibold text-slate-700">{employee.phone || "N/A"}</span>
            </div>
            <div className="flex justify-between py-1.5 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Account Status
              </span>
              <span
                className={cn(
                  "font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-[10px]",
                  employee.status === USER_STATUS.ACTIVE
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-rose-50 text-rose-700 border border-rose-100"
                )}
              >
                {employee.status}
              </span>
            </div>
            <div className="flex justify-between py-1.5 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Joined Date
              </span>
              <span className="font-semibold text-slate-700">{employee.created_at}</span>
            </div>
            <div className="flex justify-between py-1.5 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Last Terminal Login
              </span>
              <span className="font-semibold text-slate-700">
                {employee.last_login || "Never"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Terminal Access PIN
              </span>
              <span className="font-mono font-bold text-indigo-600">•••••• (Protected)</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-md"
            >
              Close View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
