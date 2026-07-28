import {
  Lock,
  Key,
  MonitorSmartphone,
  Monitor,
  Smartphone,
  LogOut,
  Layout,
  Globe,
  Bell,
  Trash2,
} from "lucide-react";
import type { Employee } from "../../types/staff";
import {
  useStaffSessions,
  useTerminateSession,
  useLogoutAllDevices,
} from "../../hooks/useStaffSessions";
import {
  useStaffPreferences,
  useUpdateStaffPreferences,
} from "../../hooks/useStaffPreferences";
import { useTheme } from "../../../../context/useTheme";

interface StaffSecurityAndPreferencesProps {
  employee: Employee;
  onOpenResetPin: () => void;
  onOpenChangePassword: () => void;
}

export const StaffSecurityAndPreferences = ({
  employee,
  onOpenResetPin,
  onOpenChangePassword,
}: StaffSecurityAndPreferencesProps) => {
  const { theme, setTheme } = useTheme();
  const { data: sessions, isLoading: sessionsLoading } = useStaffSessions(
    employee.id
  );
  const { data: preferences } = useStaffPreferences(employee.id);
  const { updatePreferences, isUpdating: isUpdatingPrefs } =
    useUpdateStaffPreferences();
  const { terminateSession } = useTerminateSession();
  const { logoutAllDevices, isLoggingOut } = useLogoutAllDevices();

  const handleThemeChange = (selectedTheme: string) => {
    if (selectedTheme === "Dark") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
    updatePreferences({
      profileId: employee.id,
      preferences: { theme: selectedTheme },
    });
  };

  const handleLanguageChange = (language: string) => {
    updatePreferences({
      profileId: employee.id,
      preferences: { language },
    });
  };

  const handleNotificationToggle = () => {
    const currentVal = preferences?.email_notifications !== false;
    updatePreferences({
      profileId: employee.id,
      preferences: { email_notifications: !currentVal },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Security Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <h3 className="text-base font-bold flex items-center gap-2.5 text-slate-800 dark:text-slate-100 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Lock size={18} />
          </div>
          Security Credentials
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border border-slate-100 dark:border-slate-800">
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Lock size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5 font-medium">Terminal PIN</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">
                  {employee.pin_hash ? "•••••" : "Not Configured"}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenResetPin}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-slate-700 dark:text-slate-200"
            >
              Reset PIN
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border border-slate-100 dark:border-slate-800">
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-amber-950/60 flex items-center justify-center text-orange-600 dark:text-amber-400 shrink-0">
                <Key size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5 font-medium">Account Password</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">
                  {employee.password_set ? "••••••••" : "Not Set"}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenChangePassword}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-slate-700 dark:text-slate-200"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Devices & Sessions Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <h3 className="text-base font-bold flex items-center gap-2.5 text-slate-800 dark:text-slate-100 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <MonitorSmartphone size={18} />
          </div>
          Devices & Active Sessions
        </h3>
        <div className="space-y-3">
          {sessionsLoading ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center font-medium">
              Loading active sessions...
            </p>
          ) : sessions && sessions.length > 0 ? (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex justify-between items-center p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="flex gap-3 items-center">
                  <div className="text-slate-400 dark:text-slate-500 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-2xs">
                    {session.device_name?.toLowerCase().includes("android") ||
                    session.device_name?.toLowerCase().includes("ios") ||
                    session.device_name?.toLowerCase().includes("mobile") ? (
                      <Smartphone size={16} />
                    ) : (
                      <Monitor size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {session.device_name || "Desktop"} • {session.browser || "Browser"}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {session.location || "Unknown Location"}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {session.is_current
                        ? "Active now"
                        : new Date(session.last_active).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.is_current ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400">
                      Current
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        terminateSession({
                          sessionId: session.id,
                          profileId: employee.id,
                        })
                      }
                      title="Terminate session"
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">1 Active Session</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Primary Web Workstation</p>
            </div>
          )}

          <button
            onClick={() => logoutAllDevices(employee.id)}
            disabled={isLoggingOut}
            className="w-full mt-3 py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer border border-rose-100 dark:border-rose-900/40"
          >
            <LogOut size={14} />
            {isLoggingOut ? "Logging out..." : "Logout All Other Devices"}
          </button>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <h3 className="text-base font-bold flex items-center gap-2.5 text-slate-800 dark:text-slate-100 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Layout size={18} />
          </div>
          User Preferences
        </h3>
        <div className="space-y-4">
          {/* Theme */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="text-slate-400 dark:text-slate-500">
                <Layout size={16} />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Theme</span>
            </div>
            <select
              value={theme === "dark" ? "Dark" : (preferences?.theme || "Light")}
              disabled={isUpdatingPrefs}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="Light">Light</option>
              <option value="Dark">Dark</option>
              <option value="System">System</option>
            </select>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="text-slate-400 dark:text-slate-500">
                <Globe size={16} />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Language</span>
            </div>
            <select
              value={preferences?.language || "English"}
              disabled={isUpdatingPrefs}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="text-slate-400 dark:text-slate-500">
                <Bell size={16} />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Notifications</span>
            </div>
            <button
              onClick={handleNotificationToggle}
              disabled={isUpdatingPrefs}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition ${
                preferences?.email_notifications !== false
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {preferences?.email_notifications !== false ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
