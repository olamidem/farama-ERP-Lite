import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../../features/auth/store/authStore";
import { UserAvatar } from "./UserAvatar";
import { UserMenu } from "./UserMenu";

export const UserDropdown = () => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate({ to: "/" });
  };

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Farama Operator";

  const displayEmail =
    user?.email ||
    profile?.email ||
    "operator@farama.com";

  const displayRole =
    typeof profile?.role === "string"
      ? profile.role
      : profile?.role?.name || "Administrator";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
      >
        <UserAvatar profile={profile} user={user} />

        <div className="text-left hidden sm:block">
          <p className="font-extrabold text-slate-800 dark:text-slate-100 text-xs leading-none">
            {displayName}
          </p>
          <p className="text-[9px] font-bold text-slate-400 mt-0.5 leading-none uppercase tracking-wider">
            {displayRole}
          </p>
        </div>
      </button>

      {/* Dropdown Menu Portal */}
      {isDropdownOpen && (
        <UserMenu
          profileName={displayName}
          userEmail={displayEmail}
          onClose={() => setIsDropdownOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};
