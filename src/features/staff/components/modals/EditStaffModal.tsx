import { StaffForm } from "../components/StaffForm";
import type { Employee, RoleData } from "../types";
import { USER_STATUS } from "../../auth/types/enums";
import type { UserStatus } from "../../auth/types/enums";

interface EditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSubmit: (
    id: string,
    data: {
      full_name: string;
      email: string;
      phone: string;
      role: string;
      status: UserStatus;
    },
  ) => void;
  roles: RoleData[];
}

export const EditStaffModal = ({
  isOpen,
  onClose,
  employee,
  onSubmit,
  roles,
}: EditStaffModalProps) => {
  if (!isOpen || !employee) return null;

  return (
    <div
      id="edit-employee-modal"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-100 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden text-left">
        <div className="border-b border-slate-50 px-6 py-5 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            Edit Operator Profile
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-black cursor-pointer"
          >
            ✕
          </button>
        </div>

        <StaffForm
          initialData={employee}
          roles={roles}
          mode="edit"
          onSubmit={(data) => {
            onSubmit(employee.id, {
              full_name: data.full_name,
              email: data.email,
              phone: data.phone,
              role: data.role,
              status: data.status || USER_STATUS.ACTIVE,
            });
            onClose();
          }}
          onCancel={onClose}
          submitButtonText="Save Changes"
        />
      </div>
    </div>
  );
};
