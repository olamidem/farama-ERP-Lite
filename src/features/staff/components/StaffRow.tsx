import { StaffAvatar } from "./StaffAvatar";
import { StaffStatusBadge } from "./StaffStatusBadge";
import { StaffActions } from "./StaffActions";
import { formatDate } from "../../../utils/formatDate";
import type { Employee, RoleData } from "../types/staff";

interface StaffRowProps {
  employee: Employee;
  roles: RoleData[];
  currentUserEmail?: string;
  onView: () => void;
  onEdit: () => void;
  onResetPin: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onRoleChange: (empId: string, newRole: string) => void;
  onResendInvitation: () => void;
  onResetPassword: () => void;
}

export const StaffRow = ({
  employee,
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
}: StaffRowProps) => {
  const isSelf = currentUserEmail === employee.email;

  return (
    <tr className="hover:bg-slate-50/50 transition">
      {/* Operator profile card */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <StaffAvatar employee={employee} />
          <div>
            <p className="text-xs font-black text-slate-800 leading-none">
              {employee.full_name}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              {employee.role}
            </p>
          </div>
        </div>
      </td>

      {/* Contact info */}
      <td className="py-4 px-6">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <span className="text-slate-400">✉</span>
            <span>{employee.email}</span>
          </p>
          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
            <span className="text-slate-400">☎</span>
            <span>{employee.phone}</span>
          </p>
        </div>
      </td>

      {/* Role Assignment */}
      <td className="py-4 px-6">
        <select
          disabled={isSelf}
          value={employee.role}
          onChange={(e) => onRoleChange(employee.id, e.target.value)}
          className="rounded-lg border border-slate-200 bg-white py-1 px-2.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </td>

      {/* Last Login */}
      <td className="py-4 px-6">
        <p className="text-xs font-bold text-slate-500">
          {employee.last_login
            ? formatDate(employee.last_login, true)
            : "Never"}
        </p>
      </td>

      {/* Access status */}
      <td className="py-4 px-6">
        <StaffStatusBadge status={employee.status} />
      </td>

      {/* Row level operations */}
      <td className="py-4 px-6 text-right">
        <StaffActions
          employee={employee}
          isSelf={isSelf}
          onView={onView}
          onEdit={onEdit}
          onResetPin={onResetPin}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          onResendInvitation={onResendInvitation}
          onResetPassword={onResetPassword}
        />
      </td>
    </tr>
  );
};
