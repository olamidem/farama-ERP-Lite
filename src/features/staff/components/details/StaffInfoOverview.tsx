import {
  User,
  Briefcase,
  Mail,
  Phone,
  CheckCircle,
  Calendar,
  Key,
  Check,
  XCircle,
} from "lucide-react";
import type { Employee, RoleData } from "../../types/staff";
import { USER_STATUS } from "../../../auth/types/enums";

interface StaffInfoOverviewProps {
  employee: Employee;
  roles: RoleData[];
  onEditProfile: () => void;
}

export const StaffInfoOverview = ({
  employee,
  roles,
  onEditProfile,
}: StaffInfoOverviewProps) => {
  const employeeRole = roles.find((r) => r.name === employee?.role);
  const permissions = employeeRole?.permissions || [];

  const allSystemPermissions = [
    "Manage Staff",
    "Manage Products",
    "Manage Inventory",
    "Create Sales",
    "View Reports",
    "Delete Staff",
    "System Settings",
    "User Role Management",
    "Accounting Access",
    "Delete Sales",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Personal Information */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold flex items-center gap-2.5 text-slate-800 dark:text-slate-100">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <User size={18} />
            </div>
            Personal Information
          </h3>
          <button
            onClick={onEditProfile}
            className="text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Edit Info
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-6">
          <div className="flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
              <User size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">Full Name</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{employee.full_name}</p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
              <Briefcase size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">Role / Position</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{employee.role}</p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
              <Mail size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">Email Address</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{employee.email}</p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">Phone Number</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{employee.phone || "N/A"}</p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">Joined Date</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {employee.joined_at
                  ? new Date(employee.joined_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
              <CheckCircle size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">Account Status</p>
              <p className="text-sm font-bold flex items-center gap-1.5 capitalize text-slate-900 dark:text-slate-100">
                <span
                  className={`w-2 h-2 rounded-full ${
                    employee.status === USER_STATUS.SUSPENDED
                      ? "bg-rose-500"
                      : employee.status === USER_STATUS.INVITED
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                />
                {employee.status?.toLowerCase() || "active"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Card */}
      <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold flex items-center gap-2.5 text-slate-800 dark:text-slate-100">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Key size={18} />
            </div>
            Role Permissions
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {allSystemPermissions.map((perm) => {
            const hasPerm =
              permissions.length > 0
                ? permissions.includes(perm)
                : employee.role?.toLowerCase().includes("admin");

            return (
              <div
                key={perm}
                className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition ${
                  hasPerm
                    ? "bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40"
                    : "bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800"
                }`}
              >
                {hasPerm ? (
                  <Check size={14} className="text-emerald-500 shrink-0" />
                ) : (
                  <XCircle size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
                )}
                <span className="truncate">{perm}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
