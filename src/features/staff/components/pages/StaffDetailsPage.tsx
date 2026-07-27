import { Link, useParams } from "@tanstack/react-router";
import {
  Mail,
  Phone,
  Calendar,
  Shield,
  History,
  RefreshCw,
  Edit,
  Lock,
  Key,
  Smartphone,
  CheckCircle,
  XCircle,
  LogOut,
  Monitor,
  Layout,
  Globe,
  Bell,
  Check,
  User,
  Clock,
  Briefcase,
  MonitorSmartphone,
  MoreVertical,
} from "lucide-react";
import { useStaff } from "../../hooks/useStaff";
import { useStaffSessions } from "../../hooks/useStaffSessions";
import { useStaffPreferences } from "../../hooks/useStaffPreferences";
import type { ActivityLog, Employee } from "../../types/staff";
import { StaffAvatar } from "../StaffAvatar";
import { USER_STATUS } from "../../../auth/types/enums";

export const StaffDetailsPage = () => {
  let productId = "";
  try {
    const params = useParams({ strict: false }) as Record<
      string,
      string | undefined
    >;
    productId = params?.productId || "";
  } catch {
    // router parameter fetching error safety
  }

  const { employees, logs, roles, isLoading } = useStaff();
  const { data: sessions, isLoading: sessionsLoading } = useStaffSessions(productId);
  const { data: preferences, isLoading: prefsLoading } = useStaffPreferences(productId);

  const employee =
    employees.find((e: Employee) => e.id === productId) || employees[0];
  
  const staffLogs = logs.filter(
    (log: ActivityLog) => log.operator_id === employee?.id || log.operator === employee?.full_name,
  ).slice(0, 5); // Only show recent 5

  const employeeRole = roles.find((r) => r.name === employee?.role);
  const permissions = employeeRole?.permissions || [];

  const allPermissions = [
    "Manage Staff",
    "Manage Products",
    "Manage Inventory",
    "Create Sales",
    "View Reports",
    "Delete Staff",
    "System Settings",
    "User Role Management",
    "Accounting Access",
    "Delete Sales",
  ]; // Placeholder for UI

  if (isLoading || sessionsLoading || prefsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-left font-sans min-h-[calc(100vh-4.5rem)] bg-slate-50/50">
        <RefreshCw className="animate-spin text-indigo-600 h-8 w-8" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Loading Profile...
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
          className="text-xs font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800"
        >
          &larr; Back to Staff Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 font-sans bg-slate-50 min-h-screen text-slate-800">

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <StaffAvatar
              employee={employee}
              className="w-20 h-20 text-3xl font-bold bg-green-800 text-white"
            />
            <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-slate-100 text-slate-500 hover:text-indigo-600">
              <Smartphone size={14} />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{employee.full_name}</h1>
            <p className="text-sm font-medium text-indigo-600 mb-2">{employee.role}</p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {employee.status === USER_STATUS.SUSPENDED ? "Suspended" : "Active"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8 flex-wrap">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
               <Briefcase size={18} />
             </div>
             <div>
               <p className="text-xs text-slate-500 font-medium">Employee ID</p>
               <p className="text-sm font-bold">{employee.employee_number || "EMP-00001"}</p>
             </div>
          </div>
          <div className="w-px h-10 bg-slate-100 hidden md:block"></div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
               <Clock size={18} />
             </div>
             <div>
               <p className="text-xs text-slate-500 font-medium">Member Since</p>
               <p className="text-sm font-bold">{employee.joined_at ? new Date(employee.joined_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "July 10, 2026"}</p>
             </div>
          </div>
          <div className="w-px h-10 bg-slate-100 hidden md:block"></div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
               <History size={18} />
             </div>
             <div>
               <p className="text-xs text-slate-500 font-medium">Last Login</p>
               <p className="text-sm font-bold">{employee.last_login ? `Today, ${new Date(employee.last_login).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : "Today, 08:11 AM"}</p>
             </div>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-sm shadow-indigo-200 ml-4">
            <Edit size={16} />
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Personal Information */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold flex items-center gap-2 text-slate-800">
              <User size={18} className="text-indigo-500" />
              Personal Information
            </h3>
            <button className="text-xs font-semibold px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
              Edit
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Full Name</p>
                <p className="text-sm font-semibold">{employee.full_name}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                <Briefcase size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Role</p>
                <p className="text-sm font-semibold">{employee.role}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Email Address</p>
                <p className="text-sm font-semibold truncate">{employee.email}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Phone Number</p>
                <p className="text-sm font-semibold">{employee.phone || "N/A"}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                <CheckCircle size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Account Status</p>
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {employee.status === USER_STATUS.SUSPENDED ? "Suspended" : "Active"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Overview */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h3 className="text-base font-bold flex items-center gap-2 text-slate-800 mb-6">
            <Layout size={18} className="text-indigo-500" />
            Account Overview
          </h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Role</p>
                <p className="text-sm font-semibold">{employee.role}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Join Date</p>
                <p className="text-sm font-semibold">{employee.joined_at ? new Date(employee.joined_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "July 10, 2026"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h3 className="text-base font-bold flex items-center gap-2 text-slate-800 mb-6">
            <Lock size={18} className="text-indigo-500" />
            Security
          </h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
              <div className="flex gap-3">
                <div className="mt-1 text-slate-400"><Lock size={16} /></div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Login PIN</p>
                  <p className="text-sm font-bold text-slate-800">•••••</p>
                </div>
              </div>
              <button className="text-xs font-semibold px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                Reset PIN
              </button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
              <div className="flex gap-3">
                <div className="mt-1 text-orange-400"><Key size={16} /></div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Password</p>
                  <p className="text-sm font-bold text-slate-800">••••••••</p>
                </div>
              </div>
              <button className="text-xs font-semibold px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* My Permissions */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold flex items-center gap-2 text-slate-800">
              <Key size={18} className="text-indigo-500" />
              My Permissions
            </h3>
            <button className="text-xs font-semibold px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {allPermissions.map((perm, idx) => {
              const hasPerm = permissions.includes(perm) || idx % 3 !== 0; // Mock logic for UI
              return (
                <div key={perm} className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${hasPerm ? 'bg-green-50/50 text-green-700' : 'bg-red-50/50 text-red-700'}`}>
                  {hasPerm ? <Check size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                  <span className="truncate">{perm}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Devices & Sessions */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h3 className="text-base font-bold flex items-center gap-2 text-slate-800 mb-6">
            <MonitorSmartphone size={18} className="text-indigo-500" />
            Devices & Sessions
          </h3>
          <div className="space-y-4">
            
            {sessions && sessions.length > 0 ? sessions.map((session) => (
              <div key={session.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100">
                <div className="flex gap-3 items-center">
                  <div className="text-slate-400">
                    {session.device_name.toLowerCase().includes('android') || session.device_name.toLowerCase().includes('ios') ? <Smartphone size={18} /> : <Monitor size={18} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{session.device_name} • {session.browser}</p>
                    <p className="text-[10px] text-slate-500">{session.location || "Unknown Location"}</p>
                    <p className="text-[10px] text-slate-500">{session.is_current ? `Today, ${new Date(session.last_active).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : new Date(session.last_active).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {session.is_current ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">Current</span>
                  ) : (
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreVertical size={16} />
                    </button>
                  )}
                </div>
              </div>
            )) : (
               <>
                 <div className="flex justify-between items-center p-3 rounded-xl border border-slate-100">
                  <div className="flex gap-3 items-center">
                    <div className="text-slate-400"><Monitor size={18} /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Windows • Chrome</p>
                      <p className="text-[10px] text-slate-500">Lagos, Nigeria</p>
                      <p className="text-[10px] text-slate-500">Today, 08:11 AM</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">Current</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl border border-slate-100">
                  <div className="flex gap-3 items-center">
                    <div className="text-slate-400"><Smartphone size={18} /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Android • Chrome</p>
                      <p className="text-[10px] text-slate-500">Lagos, Nigeria</p>
                      <p className="text-[10px] text-slate-500">Yesterday, 09:32 PM</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical size={16} />
                  </button>
                </div>
               </>
            )}

            <button className="w-full mt-2 py-2 flex items-center justify-center gap-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition">
              <LogOut size={14} />
              Logout All Devices
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold flex items-center gap-2 text-slate-800">
              <History size={18} className="text-indigo-500" />
              Recent Activity
            </h3>
            <Link to="/staff" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
              View All Activity
            </Link>
          </div>
          
          <div className="space-y-4">
            {staffLogs.length > 0 ? staffLogs.map((log) => (
              <div key={log.id} className="flex justify-between items-start border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0 mt-1">
                    <User size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{log.action}</p>
                    <p className="text-xs text-slate-500">{log.details}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                  {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )) : (
              <div className="text-center py-6">
                <p className="text-sm text-slate-500 font-medium">No recent activity found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h3 className="text-base font-bold flex items-center gap-2 text-slate-800 mb-6">
            <Layout size={18} className="text-indigo-500" />
            Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className="text-slate-400"><Layout size={16} /></div>
                <span className="text-sm font-medium text-slate-700">Theme</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                {preferences?.theme || 'Light'} 
                <span className="text-slate-300">&gt;</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className="text-slate-400"><Globe size={16} /></div>
                <span className="text-sm font-medium text-slate-700">Language</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                {preferences?.language || 'English'}
                <span className="text-slate-300">&gt;</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className="text-slate-400"><Bell size={16} /></div>
                <span className="text-sm font-medium text-slate-700">Email Notifications</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-green-600">
                {preferences?.email_notifications !== false ? 'Enabled' : 'Disabled'}
                <span className="text-slate-300">&gt;</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StaffDetailsPage;
