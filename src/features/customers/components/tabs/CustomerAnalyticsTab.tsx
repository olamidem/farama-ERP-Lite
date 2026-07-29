import { FileText, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

const areaChartData = [
  { name: "Mon", Deposits: 12000, DebtIssued: 8000, Repayments: 5000 },
  { name: "Tue", Deposits: 18000, DebtIssued: 15000, Repayments: 9000 },
  { name: "Wed", Deposits: 15000, DebtIssued: 5000, Repayments: 12000 },
  { name: "Thu", Deposits: 24000, DebtIssued: 22000, Repayments: 18000 },
  { name: "Fri", Deposits: 30000, DebtIssued: 18000, Repayments: 25000 },
  { name: "Sat", Deposits: 45000, DebtIssued: 35000, Repayments: 32000 },
  { name: "Sun", Deposits: 20000, DebtIssued: 12000, Repayments: 15000 },
];

export default function CustomerAnalyticsTab({ stats }: CustomerAnalyticsTabProps) {
  const pieChartData = [
    { name: "Prepaid Wallets", value: stats.totalPrepaid, color: "#6366F1" },
    { name: "Outstanding Debts", value: stats.totalDebt, color: "#F43F5E" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart: Ledger Trends over the week */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Total Ledger Activity & Credit Operations
              </h3>
              <p className="text-[10px] font-bold text-slate-400">
                Volume of deposits, credits issued, and debt repayments over the week
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl text-slate-500 select-none">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-wider pr-1">
                Pharmacy Credit trends
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={areaChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorDeposits"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#6366F1"
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="95%"
                      stopColor="#6366F1"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                  <linearGradient
                    id="colorDebt"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#F43F5E"
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="95%"
                      stopColor="#F43F5E"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={9}
                  tickLine={false}
                />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    fontSize: "10px",
                    borderRadius: "12px",
                    border: "1px solid #F1F5F9",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Deposits"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDeposits)"
                />
                <Area
                  type="monotone"
                  dataKey="DebtIssued"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDebt)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Store Balances breakdown */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
              Liability and Asset Portfolio
            </h3>
            <p className="text-[10px] font-bold text-slate-400">
              Breakdown of customer deposits vs total outstanding credits
            </p>
          </div>

          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: "10px", borderRadius: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center total text */}
            <div className="absolute flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Net Exposure
              </span>
              <span className="text-sm font-black text-slate-800 mt-1">
                ₦{Math.abs(stats.netPosition).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-50 pt-3">
            {pieChartData.map((d, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-[10px]"
              >
                <div className="flex items-center gap-2 font-bold text-slate-500">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span>{d.name}</span>
                </div>
                <span className="font-black text-slate-700">
                  ₦{d.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick instructions/Ledger Guide note */}
      <div className="bg-indigo-50/40 border border-indigo-100/60 rounded-3xl p-5 flex items-start gap-4">
        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 shrink-0 select-none">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Store ledger audit systems & rules
          </h4>
          <p className="text-[10px] font-semibold text-slate-500 leading-relaxed mt-1 max-w-4xl">
            The Farama Pharmacy ledger allows you to deposit advances or log credit limits
            dynamically. All client top-ups increase their prepaid custody (a liability for us, stored as
            a cash reserve). Outstanding debts represent store credit given during invoice creations or
            custom credit lines. The net store position evaluates these totals to provide full store
            exposure risk instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
