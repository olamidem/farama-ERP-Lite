import { AlertTriangle } from "lucide-react";
import { StaffRow } from "./StaffRow";
import { StaffAvatar } from "./StaffAvatar";
import { StaffStatusBadge } from "./StaffStatusBadge";
import { StaffActions } from "./StaffActions";
import { formatDate } from "../../../utils/formatDate";
import type { Employee, RoleData } from "../types/staff";


interface StaffTableProps {
  employees: Employee[];
  roles: RoleData[];
  currentUserEmail?: string;
  onView: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
  onResetPin: (emp: Employee) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (emp: Employee) => void;
  onRoleChange: (id: string, role: string) => void;
  onResendInvitation: (emp: Employee) => void;
  onResetPassword: (emp: Employee) => void;
}

export const StaffTable = ({
  employees,
  roles,
  currentUserEmail,
  onView,
  onEdit,
  onResetPin,
  onToggleStatus,
  onDelete,
  onRoleChange,
  onResendInvitation,
  onResetPassword,
}: StaffTableProps) => {
  return (
    <div className="space-y-4">
      {/* Desktop view - Beautiful table layout */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Staff Member
              </th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Contact Details
              </th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Role
              </th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Last Login
              </th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="py-4 px-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {employees.map((emp) => (
              <StaffRow
                key={emp.id}
                employee={emp}
                roles={roles}
                currentUserEmail={currentUserEmail}
                onView={() => onView(emp)}
                onEdit={() => onEdit(emp)}
                onResetPin={() => onResetPin(emp)}
                onToggleStatus={() => onToggleStatus(emp.id)}
                onDelete={() => onDelete(emp)}
                onRoleChange={onRoleChange}
                onResendInvitation={() => onResendInvitation(emp)}
                onResetPassword={() => onResetPassword(emp)}
              />
            ))}

            {employees.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-slate-300" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      No matching staff members found
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile view - Premium responsive cards layout */}
      <div className="md:hidden space-y-4">
        {employees.map((emp) => {
          const isSelf = currentUserEmail === emp.email;
          return (
            <div
              key={emp.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col gap-4"
            >
              {/* Card Header: Avatar + Info + Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <StaffAvatar employee={emp} className="w-10 h-10" />
                  <div>
                    <h4 className="text-sm font-black text-slate-800 leading-tight">
                      {emp.full_name}
                    </h4>
                    <p className="text-[10px] font-extrabold text-indigo-600 mt-1 uppercase tracking-widest">
                      {emp.role}
                    </p>
                  </div>
                </div>
                <StaffStatusBadge status={emp.status} />
              </div>

              {/* Card Body: Details */}
              <div className="grid grid-cols-1 gap-2.5 text-xs py-2 border-t border-b border-slate-50 my-1">
                {/* Contact: Email */}
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-slate-400 shrink-0 text-sm">✉</span>
                  <span className="font-semibold break-all">{emp.email}</span>
                </div>
                {/* Contact: Phone */}
                {emp.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="text-slate-400 shrink-0 text-sm">☎</span>
                    <span className="font-semibold">{emp.phone}</span>
                  </div>
                )}
                {/* Role dropdown inside card */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Role</span>
                  <select
                    disabled={isSelf}
                    value={emp.role}
                    onChange={(e) => onRoleChange(emp.id, e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition hover:border-slate-300 focus:ring-2 focus:ring-indigo-500/15"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Last login */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Last Login</span>
                  <span className="text-xs font-bold text-slate-500">
                    {emp.last_login ? formatDate(emp.last_login, true) : "Never"}
                  </span>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Actions</span>
                <StaffActions
                  employee={emp}
                  isSelf={isSelf}
                  onView={() => onView(emp)}
                  onEdit={() => onEdit(emp)}
                  onResetPin={() => onResetPin(emp)}
                  onToggleStatus={() => onToggleStatus(emp.id)}
                  onDelete={() => onDelete(emp)}
                  onResendInvitation={() => onResendInvitation(emp)}
                  onResetPassword={() => onResetPassword(emp)}
                />
              </div>
            </div>
          );
        })}

        {employees.length === 0 && (
          <div className="py-12 bg-white rounded-2xl border border-slate-100 text-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <AlertTriangle className="h-8 w-8 text-slate-300" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                No matching staff members found
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

