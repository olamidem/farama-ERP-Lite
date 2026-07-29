import { Clock, RefreshCw } from "lucide-react";
import { cn } from "../../../utils/cn";
import type { ActivityLog } from "../types/staff";

interface LogsTabProps {
  logs: ActivityLog[];
  onRefresh: () => void;
}

export const LogsTab = ({ logs, onRefresh }: LogsTabProps) => {
  return (
    <div id="logs-tab" className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={13} />
          <span>Real-time administrative security trail logs</span>
        </p>

        <button
          onClick={onRefresh}
          type="button"
          className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-colors">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Operator
              </th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Action Type
              </th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Audit Details
              </th>
              <th className="py-4 px-6 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Terminal IP
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                <td className="py-4 px-6 font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {log.timestamp}
                </td>
                <td className="py-4 px-6">
                  <div>
                    <p className="font-black text-slate-800 dark:text-slate-100">{log.operator}</p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      {log.role}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                      log.action.includes("Reset") ||
                        log.action.includes("Suspend")
                        ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800"
                        : "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800",
                    )}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 max-w-sm">
                  {log.details}
                </td>
                <td className="py-4 px-6 text-right font-mono font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {log.ipAddress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
