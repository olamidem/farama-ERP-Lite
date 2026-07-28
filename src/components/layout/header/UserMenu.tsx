import { Link } from "@tanstack/react-router";
import { User, LogOut } from "lucide-react";

interface UserMenuProps {
  profileName?: string;
  userEmail?: string;
  onClose: () => void;
  onLogout: () => void;
}

export const UserMenu = ({
  profileName,
  userEmail,
  onClose,
  onLogout,
}: UserMenuProps) => {
  return (
    <div className="absolute right-0 mt-2.5 w-60 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-3 duration-200">
      {/* Dropdown Header */}
      <div className="px-3.5 py-3 border-b border-slate-50 dark:border-slate-800 mb-1">
        <p className="text-xs font-black text-slate-800 dark:text-slate-100 leading-none">
          {profileName}
        </p>
        <p className="text-[10px] font-bold text-slate-400 mt-1 leading-none truncate">
          {userEmail}
        </p>
      </div>

      {/* Menu Links */}
      <div className="space-y-0.5">
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <User size={14} className="text-slate-400" />
          <span>My Profile</span>
        </Link>

        <div className="border-t border-slate-50 dark:border-slate-800 my-1 pt-1" />

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer text-left focus:outline-none"
        >
          <LogOut size={14} className="text-rose-500" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
