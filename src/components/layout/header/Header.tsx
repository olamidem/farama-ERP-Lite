import { Menu, Lock } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import HeaderTitle from "./HeaderTitle";
import HeaderSearch from "./HeaderSearch";
import { HeaderNotification } from "./HeaderNotification";
import { UserDropdown } from "./UserDropdown";
import { useAuthStore } from "../../../features/auth/store/authStore";

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
  const navigate = useNavigate();
  const setLocked = useAuthStore((state) => state.setLocked);

  const handleLockScreen = () => {
    setLocked(true);
    navigate({ to: "/lock-screen" });
  };

  return (
    <header className="flex h-18 items-center justify-between border-b border-slate-100 bg-white backdrop-blur-md px-4 md:px-8 shrink-0 transition-all z-30">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            id="mobile-menu-toggle"
            type="button"
            onClick={onMenuToggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 text-slate-600 hover:bg-slate-50 lg:hidden cursor-pointer shrink-0 transition"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        <HeaderTitle />
      </div>

      <div className="flex items-center gap-2.5 md:gap-3.5">
        <HeaderSearch />

        <HeaderNotification />

        {/* Lock Screen Icon Button */}
        <button
          type="button"
          onClick={handleLockScreen}
          title="Lock Screen"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-slate-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition cursor-pointer shrink-0"
          aria-label="Lock Screen"
        >
          <Lock className="h-4 w-4" />
        </button>

        <div className="h-6 w-px bg-slate-200/80 hidden sm:block mx-1 shrink-0" />

        <UserDropdown />
      </div>
    </header>
  );
};

export default Header;