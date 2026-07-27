import { useState } from "react";
import { Users, Shield, LockOpen, FileClock, RefreshCw } from "lucide-react";
import useAuthStore from "../../../auth/store/authStore";
import { useStaff } from "../../hooks/useStaff";
import { useCreateEmployee } from "../../hooks/useCreateEmployee";
import { useUpdateEmployee } from "../../hooks/useUpdateEmployee";
import { useResetPin } from "../../hooks/useResetPin";
import { useDeleteEmployee } from "../../hooks/useDeleteEmployee";
import type { Employee } from "../../types/staff";
import { USER_STATUS, type UserStatus } from "../../../auth/types/enums";
import { StaffStatsCards } from "../StaffStatusCard";
import { cn } from "../../../../utils/cn";
import StaffTab from "../StaffTab";
import RolesTab from "../RolesTab";
import PermissionTab from "../PermissionTab";
import { LogsTab } from "../LogsTab";
import { AddStaffModal } from "../modals/AddStaffModal";
import { EditStaffModal } from "../modals/EditStaffModal";
import { ViewStaffModal } from "../modals/ViewStaffModal";
import { ResetPinModal } from "../modals/ResetPinModal";
import { DeleteStaffDialog } from "../modals/DeleteStaffDialog";

export const StaffPage = () => {
  const currentUser = useAuthStore((state) => state.user);

  // Core Data Hooks
  const { employees, roles, logs, isLoading, refetch } = useStaff();
const { createEmployee } = useCreateEmployee();

const { updateEmployee } = useUpdateEmployee();

const { resetPin } = useResetPin();

const { deleteEmployee, isDeleting } = useDeleteEmployee();
// Navigation state
const [activeTab, setActiveTab] = useState<
  "employees" | "roles" | "permissions" | "logs"
>("employees");

// Modal Dialog States
const [isAddModalOpen, setIsAddModalOpen] = useState(false);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [isResetPinModalOpen, setIsResetPinModalOpen] = useState(false);
const [isViewModalOpen, setIsViewModalOpen] = useState(false);
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

// Selected Employee Context
const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

// Handlers
const handleCreateSubmit = async (data: {
  full_name: string;
  email: string;
  phone: string;
  role: string;
}) => {
  const selectedRole = roles.find((r) => r.name === data.role);

  if (!selectedRole) {
    throw new Error("Selected role does not exist.");
  }

  await createEmployee({
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    role_id: selectedRole.id,
    status: USER_STATUS.PENDING,
    avatar_color: null,
    avatar_url: null,
    pin_hash: "",
  });

  setIsAddModalOpen(false);
};

const handleEditSubmit = async (
  id: string,
  data: {
    full_name: string;
    email: string;
    phone: string;
    role: string;
    status: UserStatus;
  },
) => {
  const roleId = roles.find((r) => r.name === data.role)?.id;

  await updateEmployee({
    id,
    updates: {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      role_id: roleId,
      status: data.status,
    },
  });

  setIsEditModalOpen(false);
  setSelectedEmp(null);
};

  const handleToggleStatus = async (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;
    const newStatus =
      emp.status === USER_STATUS.ACTIVE
        ? USER_STATUS.SUSPENDED
        : USER_STATUS.ACTIVE;
    await updateEmployee({
      id,
      updates: {
        status: newStatus,
      },
    });
  };

  const handleResetPinSubmit = async (id: string, pin: string) => {
    await resetPin({
      id,
      pin_hash: pin,
    });
    setIsResetPinModalOpen(false);
    setSelectedEmp(null);
  };

  const handleRoleChange = async (empId: string, newRole: string) => {
    const roleId = roles.find((r) => r.name === newRole)?.id;

    if (!roleId) return;

    await updateEmployee({
      id: empId,
      updates: {
        role_id: roleId,
      },
    });
  };

  const handleDeleteConfirm = async () => {
    if (selectedEmp) {
      await deleteEmployee(selectedEmp.id);
      setIsDeleteModalOpen(false);
      setSelectedEmp(null);
    }
  };

  const handleResendInvitation = async (emp: Employee) => {
    // TODO: implement resend invitation
    console.log("Resend invitation to", emp.email);
  };

  const handleResetPassword = async (emp: Employee) => {
    // TODO: implement reset password
    console.log("Reset password for", emp.email);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 font-sans bg-slate-50/50 min-h-[calc(100vh-4.5rem)] select-none">
      {/* Stats Cards Section */}
      <StaffStatsCards
        employeesCount={employees.length}
        activeCount={
          employees.filter((e) => e.status === USER_STATUS.ACTIVE).length
        }
        suspendedCount={
          employees.filter((e) => e.status === USER_STATUS.SUSPENDED).length
        }
        rolesCount={roles.length}
      />

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Tab Header triggers */}
        <div className="flex border-b border-slate-100 p-4 md:p-6 gap-2 bg-slate-50/20 overflow-x-auto">
          {[
            { id: "employees", label: "Employees", icon: Users },
            { id: "roles", label: "Roles & Access Matrix", icon: Shield },
            { id: "permissions", label: "System Permissions", icon: LockOpen },
            { id: "logs", label: "Staff Activity Audit", icon: FileClock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as "employees" | "roles" | "permissions" | "logs",
                  )
                }
                type="button"
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
                  active
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                )}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab contents block */}
        <div className="p-4 md:p-8 flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <RefreshCw className="animate-spin text-indigo-600 h-8 w-8" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Synchronizing Staff Directory...
              </p>
            </div>
          ) : (
            <>
              {activeTab === "employees" && (
                <StaffTab
                  employees={employees}
                  roles={roles}
                  logs={logs}
                  currentUserEmail={currentUser?.email ?? ""}
                  onAddClick={() => setIsAddModalOpen(true)}
                  onViewClick={(emp) => {
                    setSelectedEmp(emp);
                    setIsViewModalOpen(true);
                  }}
                  onEditClick={(emp) => {
                    setSelectedEmp(emp);
                    setIsEditModalOpen(true);
                  }}
                  onResetPinClick={(emp) => {
                    setSelectedEmp(emp);
                    setIsResetPinModalOpen(true);
                  }}
                  onToggleStatus={handleToggleStatus}
                  onDeleteClick={(emp) => {
                    setSelectedEmp(emp);
                    setIsDeleteModalOpen(true);
                  }}
                  onRoleChange={handleRoleChange}
                  onResendInvitation={handleResendInvitation}
                  onResetPassword={handleResetPassword}
                  onTabChange={setActiveTab}
                />
              )}

              {activeTab === "roles" && <RolesTab roles={roles} />}

              {activeTab === "permissions" && <PermissionTab />}

              {activeTab === "logs" && (
                <LogsTab logs={logs} onRefresh={() => refetch()} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Dialog Mounts */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateSubmit}
        roles={roles}
      />

      <EditStaffModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmp(null);
        }}
        employee={selectedEmp}
        onSubmit={handleEditSubmit}
        roles={roles}
      />

      <ResetPinModal
        isOpen={isResetPinModalOpen}
        onClose={() => {
          setIsResetPinModalOpen(false);
          setSelectedEmp(null);
        }}
        employee={selectedEmp}
        onSubmit={handleResetPinSubmit}
      />

      <ViewStaffModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedEmp(null);
        }}
        employee={selectedEmp}
      />

      <DeleteStaffDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedEmp(null);
        }}
        employeeName={selectedEmp?.full_name || ""}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default StaffPage;
