import { AlertTriangle } from "lucide-react";
import { StaffRow } from "./StaffRow";
import type { Employee, RoleData } from "../types";

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
}: StaffTableProps) => {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-xs">
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
    </div>
  );
};
