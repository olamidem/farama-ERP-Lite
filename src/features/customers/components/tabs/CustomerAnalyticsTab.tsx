import {
  Wallet,
  CreditCard,
  TrendingUp,
  Users,
  Award,
  ShieldAlert,
} from "lucide-react";
import { formatNaira } from "../../lib/customerExport";

interface CustomerAnalyticsTabProps {
  stats: {
    totalPrepaid: number;
    totalDebt: number;
    netPosition: number;
    topPrepaidCust: string;
    topDebtorCust: string;
    registeredCount: number;
  };
}

export default function CustomerAnalyticsTab({
  stats,
}: CustomerAnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Wallet Funds */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
              Total Pre-funded Balance
            </span>
            <div className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100">
            {formatNaira(stats.totalPrepaid)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
            Combined deposit liabilities held in customer wallets
          </p>
        </div>

        {/* Total Receivables / Credit */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
              Total Outstanding Credit
            </span>
            <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100">
            {formatNaira(stats.totalDebt)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
            Unsettled store credit owed by registered customers
          </p>
        </div>

        {/* Net Customer Position */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
              Net Financial Position
            </span>
            <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div
            className={`text-2xl font-black font-mono ${
              stats.netPosition >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatNaira(stats.netPosition)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
            Difference between wallet deposits & outstanding receivables
          </p>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-slate-900 dark:bg-slate-800/90 text-white border border-transparent dark:border-slate-700 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-wider">
            <Users className="h-4 w-4" />
            <span>Registered Directory</span>
          </div>
          <div className="text-3xl font-black font-mono">
            {stats.registeredCount}
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Active customer accounts in database
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-emerald-950 dark:bg-emerald-950/80 text-white border border-transparent dark:border-emerald-900/60 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
            <Award className="h-4 w-4" />
            <span>Top Wallet Holder</span>
          </div>
          <div className="text-lg font-black text-emerald-100 truncate">
            {stats.topPrepaidCust}
          </div>
          <p className="text-xs text-emerald-400/80 font-medium">
            Highest prepaid wallet customer
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-rose-950 dark:bg-rose-950/80 text-white border border-transparent dark:border-rose-900/60 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4" />
            <span>Top Debtor Account</span>
          </div>
          <div className="text-lg font-black text-rose-100 truncate">
            {stats.topDebtorCust}
          </div>
          <p className="text-xs text-rose-400/80 font-medium">
            Highest unsettled store balance
          </p>
        </div>
      </div>
    </div>
  );
}
