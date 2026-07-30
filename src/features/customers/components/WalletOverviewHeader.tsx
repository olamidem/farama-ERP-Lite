import { Wallet, ArrowDownLeft, ArrowUpRight, ShoppingBag } from "lucide-react";
import { useWalletOverviewStats } from "../hooks/useCustomerWallet";
import { formatCurrency } from "../../../utils/formatCurrenty";

export default function WalletOverviewHeader() {
  const { data: stats } = useWalletOverviewStats();

  const totalBalance = stats?.totalWalletBalance || 0;
  const depositsToday = stats?.depositsToday || 0;
  const withdrawalsToday = stats?.withdrawalsToday || 0;
  const walletPaymentsToday = stats?.walletPaymentsToday || 0;

  return (
    <div className="space-y-4">
      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Wallet Balance */}
        <div className="p-5 rounded-3xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10 space-y-2">
          <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest block">
            Total Customer Balance
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black font-mono tracking-tight">
              {formatCurrency(totalBalance)}
            </span>
            <div className="p-2 rounded-2xl bg-indigo-500 text-indigo-100">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-indigo-200 font-bold">
            Total funds held in active customer wallets
          </p>
        </div>

        {/* Deposits Today */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
            Deposits Today
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              {formatCurrency(depositsToday)}
            </span>
            <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold">
            Fresh wallet top-ups collected today
          </p>
        </div>

        {/* Withdrawals Today */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
            Withdrawals Today
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
              {formatCurrency(withdrawalsToday)}
            </span>
            <div className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold">
            Cash payouts disbursed from customer wallets
          </p>
        </div>

        {/* Wallet POS Payments */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
            Wallet Sales Today
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
              {formatCurrency(walletPaymentsToday)}
            </span>
            <div className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold">
            POS checkouts settled via wallet balance
          </p>
        </div>
      </div>
    </div>
  );
}
