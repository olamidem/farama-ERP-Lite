import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  History,
  RefreshCw,
} from "lucide-react";
import { useStaff } from "../hooks/useStaff";
import { StaffAvatar } from "../components/StaffAvatar";
import { StaffStatusBadge } from "../components/StaffStatusBadge";
import type { Employee, ActivityLog } from "../types";

export const StaffDetailsPage = () => {
  // Try to read dynamic parameters if registered, or fall back gracefully
  let productId = "";
  try {
    const params = useParams({ strict: false }) as Record<
      string,
      string | undefined
    >;
    productId = params?.productId || "";
  } catch {
    // router parameter fetching error safety
  }

  const { employees, logs, isLoading } = useStaff();

  // Find employee by ID, otherwise show the first one or a placeholder
  const employee =
    employees.find((e: Employee) => e.id === productId) || employees[0];
  const staffLogs = logs.filter(
    (log: ActivityLog) => log.operator === employee?.full_name,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-left font-sans min-h-[calc(100vh-4.5rem)] bg-slate-50/50">
        <RefreshCw className="animate-spin text-indigo-600 h-8 w-8" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Retrieving Operator Profile...
        </p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-left font-sans min-h-[calc(100vh-4.5rem)] bg-slate-50/50">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Staff Profile Not Found
        </p>
        <Link
          to="/staff"
          className="text-xs font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800"
        >
          &larr; Back to Staff Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 font-sans bg-slate-50/50 min-h-[calc(100vh-4.5rem)] select-none text-left">
      {/* Header Back Button */}
      <div className="flex items-center gap-3">
        <Link
          to="/staff"
          className="p-2 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-600 transition"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">
            Staff Member Profile
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Detailed operational details and audit trail
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Basic Card & Details */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-slate-50">
            <StaffAvatar
              employee={employee}
              className="w-24 h-24 text-4xl font-black"
            />
            <div>
              <h3 className="text-base font-black text-slate-800 tracking-tight">
                {employee.full_name}
              </h3>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mt-0.5">
                {employee.role}
              </p>
            </div>
            <div className="pt-1">
              <StaffStatusBadge
                status={
                  employee.status === "suspended" ? "suspended" : "active"
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Contact Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-700 truncate">
                  {employee.email}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-700">
                  {employee.phone || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Calendar size={14} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-700">
                  Joined {employee.joined_at}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Roles & Audit Trail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Permissions / Role capabilities card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Shield size={16} className="text-indigo-600" />
              <span>Assigned Permissions for {employee.role}</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Operators assigned to the{" "}
              <strong className="text-slate-700">{employee.role}</strong> role
              have access to system catalog viewing and specific point-of-sale
              operational panels.
            </p>
          </div>

          {/* Audit trail */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
              <History size={16} className="text-indigo-600" />
              <span>Recent Security Audit Log</span>
            </h4>

            <div className="divide-y divide-slate-50">
              {staffLogs.map((log: ActivityLog) => (
                <div
                  key={log.id}
                  className="py-3 flex justify-between items-start text-xs gap-4"
                >
                  <div>
                    <p className="font-bold text-slate-700">{log.details}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Action: {log.action} &bull; IP: {log.ipAddress}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              ))}

              {staffLogs.length === 0 && (
                <p className="text-xs text-slate-400 py-6 font-bold text-center uppercase tracking-wider">
                  No audit logs found for this operator
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailsPage;
