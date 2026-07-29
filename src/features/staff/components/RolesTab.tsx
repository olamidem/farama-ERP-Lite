import { Shield } from "lucide-react";
import type { RoleData } from "../types/staff";

interface RolesTabProps {
  roles: RoleData[];
}

export const RolesTab = ({ roles }: RolesTabProps) => {
  return (
    <div id="roles-tab" className="space-y-6 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((r) => (
          <div
            key={r.id}
            className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col gap-4 relative overflow-hidden animate-fade-in transition-colors"
          >
            <div className="absolute right-4 top-4 text-xs font-black uppercase text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2 py-1 rounded-lg">
              {r.member_count ?? 0} {r.member_count === 1 ? "operator" : "operators"}
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Shield size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span>{r.name}</span>
              </h4>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {r.member_count ?? 0}
                  </span>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                {r.description}
              </p>
            </div>

            <div className="border-t border-slate-50 dark:border-slate-800 pt-4 flex flex-col gap-2">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Granted Capabilities
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {r.permissions.map((pCode: string) => (
                  <span
                    key={pCode}
                    className="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/50 dark:border-indigo-800 px-2.5 py-0.5 rounded-lg"
                  >
                    {pCode}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RolesTab;
