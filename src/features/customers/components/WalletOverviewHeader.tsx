import { Wallet, ArrowDownLeft, ArrowUpRight, ShoppingBag } from "lucide-react";
import { useWalletOverviewStats } from "../hooks/useCustomerWallet";

interface WalletOverviewHeaderProps {
  onOpenDeposit?: () => void;
  onOpenStatement?: () => void;
  onOpenNewCustomer?: () => void;
}

export default function WalletOverviewHeader({}: WalletOverviewHeaderProps) {
  const { data: stats } = useWalletOverviewStats();

  const totalBalance = stats?.total_wallet_balance ?? 0;
  const depositsToday = stats?.deposits_today ?? 0;
  const withdrawalsToday = stats?.withdrawals_today ?? 0;
  const walletPaymentsToday = stats?.wallet_payments_today ?? 0;

  const formatMoney = (value: number) =>
    `₦${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
            Total Customer Balance
          </span>

          <div className="flex items-center justify-between">
            <span className="font-mono text-2xl font-black tracking-tight text-indigo-700">
              {formatMoney(totalBalance)}
            </span>

            <div className="rounded-2xl bg-indigo-50 p-2 text-indigo-600">
              <Wallet className="h-5 w-5" />
            </div>
          </div>

          <p className="text-[10px] font-extrabold text-slate-400">
            Total funds held in active customer wallets.
          </p>
        </div>

        <div className="space-y-2 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
            Deposits Today
          </span>

          <div className="flex items-center justify-between">
            <span className="font-mono text-xl font-black tracking-tight text-emerald-600">
              {formatMoney(depositsToday)}
            </span>

            <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-600">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>

          <p className="text-[10px] font-extrabold text-slate-400">
            Fresh wallet deposits received today.
          </p>
        </div>

        <div className="space-y-2 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
            Withdrawals Today
          </span>

          <div className="flex items-center justify-between">
            <span className="font-mono text-xl font-black tracking-tight text-rose-600">
              {formatMoney(withdrawalsToday)}
            </span>

            <div className="rounded-2xl bg-rose-50 p-2 text-rose-600">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>

          <p className="text-[10px] font-extrabold text-slate-400">
            Wallet withdrawals processed today.
          </p>
        </div>

        <div className="space-y-2 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
            Wallet Sales Today
          </span>

          <div className="flex items-center justify-between">
            <span className="font-mono text-xl font-black tracking-tight text-indigo-600">
              {formatMoney(walletPaymentsToday)}
            </span>

            <div className="rounded-2xl bg-indigo-50 p-2 text-indigo-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>

          <p className="text-[10px] font-extrabold text-slate-400">
            POS sales paid using customer wallets.
          </p>
        </div>
      </div>
    </div>
  );
}
