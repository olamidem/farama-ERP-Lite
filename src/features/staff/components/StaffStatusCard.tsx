import { Users, UserCheck, UserX, Shield } from "lucide-react";

interface StaffStatsCardsProps {
  employeesCount: number;
  activeCount: number;
  suspendedCount: number;
  rolesCount: number;
}

export const StaffStatsCards = ({
  employeesCount,
  activeCount,
  suspendedCount,
  rolesCount,
}: StaffStatsCardsProps) => {
  const stats = [
    {
      id: "total_staff",
      label: "Total Staff",
      value: employeesCount,
      icon: Users,
      bgColor: "bg-indigo-50 text-indigo-600",
    },
    {
      id: "active_accounts",
      label: "Active Accounts",
      value: activeCount,
      icon: UserCheck,
      bgColor: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "suspended_accounts",
      label: "Suspended Accounts",
      value: suspendedCount,
      icon: UserX,
      bgColor: "bg-rose-50 text-rose-600",
    },
    {
      id: "roles_assigned",
      label: "Roles Assigned",
      value: rolesCount,
      icon: Shield,
      bgColor: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div id="staff-stats-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            id={`stat-card-${stat.id}`}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 text-left"
          >
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <h3 className="text-xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};
