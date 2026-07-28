import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useStaff } from "../../hooks/useStaff";
import { useUpdateEmployee } from "../../hooks/useUpdateEmployee";
import { useResetPin } from "../../hooks/useResetPin";
import { useAuthStore } from "../../../auth/store/authStore";
import type { Employee } from "../../types/staff";
import type { UserStatus } from "../../../auth/types/enums";
import { EditStaffModal } from "../modals/EditStaffModal";
import { ResetPinModal } from "../modals/ResetPinModal";
import { ChangePasswordModal } from "../modals/ChangePasswordModal";
import useChangePassword from "../../hooks/useChangePassword";
import { StaffHeader } from "../details/StaffHeader";
import { StaffInfoOverview } from "../details/StaffInfoOverview";
import { StaffSecurityAndPreferences } from "../details/StaffSecurityAndPreferences";

export const StaffDetailsPage = () => {
  let productId = "";

  try {
    const params = useParams({ strict: false }) as Record<
      string,
      string | undefined
    >;
    productId = params?.productId || "";
  } catch {
    // Router parameter fallback
  }

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  const { employees, roles, isLoading } = useStaff();
  const { updateEmployee } = useUpdateEmployee();
  const { resetPin } = useResetPin();
  const { changePassword, isChangingPassword } = useChangePassword();

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPinOpen, setIsResetPinOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const matchedEmployee = employees.find(
    (e: Employee) =>
      (productId && e.id === productId) ||
      (!productId &&
        (e.id === profile?.id ||
          e.email === profile?.email ||
          e.email === user?.email ||
          e.id === user?.id)),
  );

  const loggedInEmployeeFallback: Employee | null =
    profile || user
      ? {
          id: profile?.id || user?.id || "current-user",
          full_name:
            profile?.full_name ||
            user?.user_metadata?.full_name ||
            user?.email?.split("@")[0] ||
            "Logged User",
          email: profile?.email || user?.email || "",
          phone: profile?.phone || "",
          role:
            typeof profile?.role === "string"
              ? profile.role
              : profile?.role?.name || "Administrator",
          status: (profile?.status as UserStatus) || "ACTIVE",
          avatar_color: profile?.avatar_color || null,
          avatar_url: profile?.avatar_url || null,
          last_login: user?.last_sign_in_at || new Date().toISOString(),
          created_at: profile?.created_at || new Date().toISOString(),
          updated_at: profile?.updated_at || new Date().toISOString(),
          joined_at: profile?.created_at || new Date().toISOString(),
          pin_hash: null,
          password_set: true,
        }
      : null;

  const employee = productId
    ? matchedEmployee || employees[0]
    : matchedEmployee || loggedInEmployeeFallback || employees[0];

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
    await updateEmployee({
      id,
      updates: data,
    });
    setIsEditModalOpen(false);
  };

  const handleResetPinSubmit = async (id: string, pin: string) => {
    await resetPin({ id, pin_hash: pin });
    setIsResetPinOpen(false);
  };

  const handleChangePasswordSubmit = async (
    profileId: string,
    newPassword: string,
  ) => {
    await changePassword({ profileId, newPassword });
    setIsChangePasswordOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-left font-sans min-h-[calc(100vh-4.5rem)] bg-slate-50/50">
        <RefreshCw className="animate-spin text-indigo-600 h-8 w-8" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Loading Operator Profile...
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
          className="text-xs font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800 mt-2"
        >
          &larr; Back to Staff Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 font-sans bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
      {/* Component 1: Staff Profile Header */}
      <StaffHeader
        employee={employee}
        onEditProfile={() => setIsEditModalOpen(true)}
      />

      {/* Component 2: Staff Information & Overview */}
      <StaffInfoOverview
        employee={employee}
        roles={roles}
        onEditProfile={() => setIsEditModalOpen(true)}
      />

      {/* Component 3: Security, Devices, & Preferences */}
      <StaffSecurityAndPreferences
        employee={employee}
        onOpenResetPin={() => setIsResetPinOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
      />

      {/* Modals */}
      <EditStaffModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={employee}
        roles={roles}
        onSubmit={handleEditSubmit}
      />

      <ResetPinModal
        isOpen={isResetPinOpen}
        onClose={() => setIsResetPinOpen(false)}
        employee={employee}
        onSubmit={handleResetPinSubmit}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        employee={employee}
        onSubmit={handleChangePasswordSubmit}
        isSubmitting={isChangingPassword}
      />
    </div>
  );
};

export default StaffDetailsPage;
