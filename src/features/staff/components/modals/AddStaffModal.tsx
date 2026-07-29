import type { RoleData } from "../../types/staff";
import { StaffForm } from "../StaffForm";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    full_name: string;
    email: string;
    phone: string;
    role: string;
    pin: string;
  }) => void;
  roles: RoleData[];
}

export const AddStaffModal = ({
  isOpen,
  onClose,
  onSubmit,
  roles,
}: AddStaffModalProps) => {
  if (!isOpen) return null;

  return (
    <div id="add-employee-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-100 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden text-left transition-colors">
        <div className="border-b border-slate-50 dark:border-slate-800 px-6 py-5 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Register New Staff</h3>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-black cursor-pointer"
          >
            ✕
          </button>
        </div>

        <StaffForm
          roles={roles}
          mode="create"
          onSubmit={(data) => {
            onSubmit({
              full_name: data.full_name,
              email: data.email,
              phone: data.phone,
              role: data.role,
              pin: data.pin || "",
            });
            onClose();
          }}
          onCancel={onClose}
          submitButtonText="Register Operator"
        />
      </div>
    </div>
  );
};
