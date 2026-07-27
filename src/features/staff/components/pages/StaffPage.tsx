import { useState } from "react";
import { Users, Shield, LockOpen, FileClock, RefreshCw } from "lucide-react";

import { AddStaffModal } from "../modals/AddStaffModal";
import { EditStaffModal } from "../modals/EditStaffModal";
import { ResetPinModal } from "../modals/ResetPinModal";
import { ViewStaffModal } from "../modals/ViewStaffModal";
import { DeleteStaffDialog } from "../modals/DeleteStaffDialog";
import useAuthStore from "../../../auth/store/authStore";
import { useStaff } from "../../hooks/useStaff";
import { useCreateEmployee } from "../../hooks/useCreateEmployee";
import { useUpdateEmployee } from "../../hooks/useUpdateEmployee";
import { useResetPin } from "../../hooks/useResetPin";
import { useDeleteEmployee } from "../../hooks/useDeleteEmployee";
import type { Employee } from "../../types/staff";
import { cn } from "../../../../utils/cn";

import StaffTab from "../StaffTab";
import RolesTab from "../RolesTab";
import PermissionTab from "../PermissionTab";
import { LogsTab } from "../LogsTab";
import { StaffStatsCards } from "../StaffStatusCard";
import { USER_STATUS } from "../../../auth/types/enums";

export const StaffPage = () => {
  const currentUser = useAuthStore((state) => state.user);

  const { employees, roles, logs, isLoading, refetch } = useStaff();

  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const resetPinMutation = useResetPin();
  const deleteEmployeeMutation = useDeleteEmployee();

  const [activeTab, setActiveTab] = useState<
    "employees" | "roles" | "permissions" | "logs"
  >("employees");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPinModalOpen, setIsResetPinModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

const handleCreateSubmit = async (data: { full_name: string; email: string; phone: string; role: string; pin?: string }) => {
  await createEmployeeMutation.mutateAsync({
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    role_id: data.role,
    pin_hash: data.pin || "",
  });
  setIsAddModalOpen(false);
};

const handleEditSubmit = async (id: string, data: { full_name: string; email: string; phone: string; role: string; status?: string }) => {
  await updateEmployeeMutation.mutateAsync({
    id,
    updates: {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      role_id: data.role,
      status: data.status as any,
    },
  });

  setIsEditModalOpen(false);
  setSelectedEmp(null);
};

const handleResetPinSubmit = async (id: string, pin_hash: string) => {
  await resetPinMutation.mutateAsync({
    id,
    pin_hash,
  });

  setSelectedEmp(null);
  setIsResetPinModalOpen(false);
};

const handleDeleteConfirm = async () => {
  if (!selectedEmp) return;

  await deleteEmployeeMutation.mutateAsync(selectedEmp.id);

  setSelectedEmp(null);
  setIsDeleteModalOpen(false);
};

  const handleToggleStatus = async (id: string) => {
    const emp = employees.find((e) => e.id === id);

    if (!emp) return;

    const status =
      emp.status === USER_STATUS.ACTIVE
        ? USER_STATUS.SUSPENDED
        : USER_STATUS.ACTIVE;

    await updateEmployeeMutation.mutateAsync({
      id,
      updates: { status },
    });
  };

  const handleRoleChange = async (empId: string, role_id: string) => {
    await updateEmployeeMutation.mutateAsync({
      id: empId,
      updates: {
        role_id,
      },
    });
  };



  return (
    <div className="space-y-6">
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

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="flex border-b border-slate-100 p-4 md:p-6 gap-2 bg-slate-50/20 overflow-x-auto">
          {[
            {
              id: "employees",
              label: "Employees",
              icon: Users,
            },
            {
              id: "roles",
              label: "Roles & Access Matrix",
              icon: Shield,
            },
            {
              id: "permissions",
              label: "System Permissions",
              icon: LockOpen,
            },
            {
              id: "logs",
              label: "Staff Activity Audit",
              icon: FileClock,
            },
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
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100",
                )}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 md:p-8 flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <RefreshCw className="animate-spin h-8 w-8 text-indigo-600" />
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

      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateSubmit}
        roles={roles}
      />

      <EditStaffModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setSelectedEmp(null);
          setIsEditModalOpen(false);
        }}
        employee={selectedEmp}
        onSubmit={handleEditSubmit}
        roles={roles}
      />

      <ResetPinModal
        isOpen={isResetPinModalOpen}
        onClose={() => {
          setSelectedEmp(null);
          setIsResetPinModalOpen(false);
        }}
        employee={selectedEmp}
        onSubmit={handleResetPinSubmit}
      />

      <ViewStaffModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setSelectedEmp(null);
          setIsViewModalOpen(false);
        }}
        employee={selectedEmp}
      />

      <DeleteStaffDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setSelectedEmp(null);
          setIsDeleteModalOpen(false);
        }}
        employeeName={selectedEmp?.full_name ?? ""}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteEmployeeMutation.isPending}
      />
    </div>
  );
};

