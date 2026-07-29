import { useState, useMemo } from "react";
import { ShieldCheck, Shield, Users, UserMinus, PlusCircle, Edit2, Key, UserCheck } from "lucide-react";
import { cn } from "../../../utils/cn";
import { StaffFilters } from "./StaffFilters";
import { StaffTable } from "./StaffTable";
import Pagination from "../../../components/ui/pagination/Pagination";
import type { ActivityLog, Employee, RoleData } from "../types/staff";
import { USER_STATUS } from "../../auth/types/enums";
import { useEmployeeFilters } from "../hooks/useEmployeeFilters";

interface StaffTabProps {
  employees: Employee[];
  roles: RoleData[];
  logs: ActivityLog[];
  currentUserEmail?: string;
  onAddClick: () => void;
  onViewClick: (emp: Employee) => void;
  onEditClick: (emp: Employee) => void;
  onResetPinClick: (emp: Employee) => void;
  onToggleStatus: (id: string) => void;
  onDeleteClick: (emp: Employee) => void;
  onRoleChange: (id: string, role: string) => void;
  onResendInvitation: (emp: Employee) => void;
  onResetPassword: (emp: Employee) => void;
  onTabChange: (tab: "employees" | "roles" | "permissions" | "logs") => void;
}

export const StaffTab = ({
  employees,
  roles,
  logs,
  currentUserEmail,
  onAddClick,
  onViewClick,
  onEditClick,
  onResetPinClick,
  onToggleStatus,
  onDeleteClick,
  onRoleChange,
  onResendInvitation,
  onResetPassword,
  onTabChange,
}: StaffTabProps) => {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredEmployees,
  } = useEmployeeFilters(employees);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(startIndex, startIndex + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (filter: "all" | "active" | "suspended") => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const getLogIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("create") || act.includes("register")) return PlusCircle;
    if (act.includes("edit") || act.includes("update")) return Edit2;
    if (act.includes("suspend")) return UserMinus;
    if (act.includes("pin")) return Key;
    return UserCheck;
  };

  const getLogColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("create") || act.includes("register")) {
      return { color: "text-emerald-600 dark:text-emerald-400", bgLight: "bg-emerald-50 dark:bg-emerald-950/50" };
    }
    if (act.includes("edit") || act.includes("update")) {
      return { color: "text-blue-600 dark:text-blue-400", bgLight: "bg-blue-50 dark:bg-blue-950/50" };
    }
    if (act.includes("suspend") || act.includes("delete")) {
      return { color: "text-orange-500 dark:text-orange-400", bgLight: "bg-orange-50 dark:bg-orange-950/50" };
    }
    if (act.includes("pin")) {
      return { color: "text-purple-600 dark:text-purple-400", bgLight: "bg-purple-50 dark:bg-purple-950/50" };
    }
    return { color: "text-indigo-600 dark:text-indigo-400", bgLight: "bg-indigo-50 dark:bg-indigo-950/50" };
  };

  return (
    <div id="employee-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-left">
      {/* Left Column: Filter & Table */}
      <div className="lg:col-span-2 space-y-6">
        <StaffFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onAddClick={onAddClick}
        />

        <StaffTable
          employees={paginatedEmployees}
          roles={roles}
          currentUserEmail={currentUserEmail}
          onView={onViewClick}
          onEdit={onEditClick}
          onResetPin={onResetPinClick}
          onToggleStatus={onToggleStatus}
          onDelete={onDeleteClick}
          onRoleChange={onRoleChange}
          onResendInvitation={onResendInvitation}
          onResetPassword={onResetPassword}
        />

        <Pagination
          page={currentPage}
          pageSize={pageSize}
          totalItems={filteredEmployees.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          itemName="employees"
        />
      </div>

      {/* Right Column: Roles Overview & Recent Activity */}
      <div className="space-y-6">
        {/* Roles Overview Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">Roles Overview</h3>
            <button
              onClick={() => onTabChange("roles")}
              type="button"
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition cursor-pointer"
            >
              View all roles
            </button>
          </div>

          <div className="space-y-5">
            {[
              {
                name: "Administrator",
                count: employees.filter(
                  (e) =>
                    (typeof e.role === "object" ? (e.role as unknown as { name?: string })?.name : e.role) === "Administrator" &&
                    e.status === USER_STATUS.ACTIVE
                ).length,
                percent:
                  employees.length > 0
                    ? Math.round(
                        (employees.filter(
                          (e) =>
                            (typeof e.role === "object" ? (e.role as unknown as { name?: string })?.name : e.role) === "Administrator" &&
                            e.status === USER_STATUS.ACTIVE
                        ).length /
                          employees.length) *
                          100
                      )
                    : 0,
                icon: ShieldCheck,
                color: "text-purple-600 dark:text-purple-400",
                bgLight: "bg-purple-50 dark:bg-purple-950/50",
                bgBar: "bg-purple-600 dark:bg-purple-500",
              },
              {
                name: "Manager",
                count: employees.filter((e) => (typeof e.role === "object" ? (e.role as unknown as { name?: string })?.name : e.role) === "Manager" && e.status === USER_STATUS.ACTIVE).length,
                percent:
                  employees.length > 0
                    ? Math.round(
                        (employees.filter((e) => (typeof e.role === "object" ? (e.role as unknown as { name?: string })?.name : e.role) === "Manager" && e.status === USER_STATUS.ACTIVE).length /
                          employees.length) *
                          100
                      )
                    : 0,
                icon: Shield,
                color: "text-blue-600 dark:text-blue-400",
                bgLight: "bg-blue-50 dark:bg-blue-950/50",
                bgBar: "bg-blue-600 dark:bg-blue-500",
              },
              {
                name: "Cashier",
                count: employees.filter((e) => (typeof e.role === "object" ? (e.role as unknown as { name?: string })?.name : e.role) === "Cashier" && e.status === USER_STATUS.ACTIVE).length,
                percent:
                  employees.length > 0
                    ? Math.round(
                        (employees.filter((e) => (typeof e.role === "object" ? (e.role as unknown as { name?: string })?.name : e.role) === "Cashier" && e.status === USER_STATUS.ACTIVE).length /
                          employees.length) *
                          100
                      )
                    : 0,
                icon: Users,
                color: "text-orange-600 dark:text-orange-400",
                bgLight: "bg-orange-50 dark:bg-orange-950/50",
                bgBar: "bg-orange-600 dark:bg-orange-500",
              },
              {
                name: "Storekeeper",
                count: employees.filter(
                  (e) =>
                    (typeof e.role === "object" ? (e.role as unknown as { name?: string })?.name : e.role) === "Storekeeper" &&
                    e.status === USER_STATUS.ACTIVE
                ).length,
                percent:
                  employees.length > 0
                    ? Math.round(
                        (employees.filter(
                          (e) =>
                            (typeof e.role === "object" ? (e.role as unknown as { name?: string })?.name : e.role) === "Storekeeper" &&
                            e.status === USER_STATUS.ACTIVE
                        ).length /
                          employees.length) *
                          100
                      )
                    : 0,
                icon: Users,
                color: "text-cyan-600 dark:text-cyan-400",
                bgLight: "bg-cyan-50 dark:bg-cyan-950/50",
                bgBar: "bg-cyan-600 dark:bg-cyan-500",
              },
              {
                name: "Inactive",
                count: employees.filter((e) => e.status === USER_STATUS.SUSPENDED).length,
                percent:
                  employees.length > 0
                    ? Math.round(
                        (employees.filter((e) => e.status === USER_STATUS.SUSPENDED).length /
                          employees.length) *
                          100
                      )
                    : 0,
                icon: UserMinus,
                color: "text-slate-500 dark:text-slate-400",
                bgLight: "bg-slate-100 dark:bg-slate-800",
                bgBar: "bg-slate-500 dark:bg-slate-400",
              },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center", r.bgLight)}>
                  <r.icon size={15} className={r.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span className="truncate">{r.name}</span>
                    <span className="text-slate-800 dark:text-slate-100 font-extrabold">{r.count}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", r.bgBar)}
                        style={{ width: `${r.percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-10 text-right">
                      {r.percent}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Card - Linked directly to Database Activity Logs */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">Recent Activity</h3>
            <button
              onClick={() => onTabChange("logs")}
              type="button"
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition cursor-pointer"
            >
              View all activity
            </button>
          </div>

          <div className="space-y-5">
            {logs.slice(0, 5).map((act) => {
              const IconComp = getLogIcon(act.action);
              const colorInfo = getLogColor(act.action);
              return (
                <div key={act.id} className="flex gap-3">
                  <div className={cn("p-2 rounded-full shrink-0 h-9 w-9 flex items-center justify-center", colorInfo.bgLight)}>
                    <IconComp size={15} className={colorInfo.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-700 dark:text-slate-200 leading-snug">{act.details}</p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">by {act.operator}</p>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0 self-start mt-0.5">
                    {act.timestamp.includes(" ") ? act.timestamp.split(" ")[1] || act.timestamp : act.timestamp}
                  </div>
                </div>
              );
            })}

            {logs.length === 0 && (
              <p className="text-xs text-center font-bold text-slate-400 dark:text-slate-500 py-6 uppercase tracking-wider">
                No recent activity logged
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default StaffTab;
