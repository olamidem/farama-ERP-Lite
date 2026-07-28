import { motion } from "motion/react";
import { Box, CheckCircle2, Shield, User } from "lucide-react";
import type { Unit } from "../types/unit";

interface UnitSummaryProps {
  units: Unit[];
}

export const UnitSummary = ({ units }: UnitSummaryProps) => {
  const total = units.length;
  const active = units.filter((u) => u.is_active).length;
  const system = units.filter((u) => u.is_system).length;
  const custom = units.filter((u) => !u.is_system).length;

  const cards = [
    {
      title: "Total Units",
      value: total,
      icon: Box,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100/50 dark:border-indigo-900/50",
    },
    {
      title: "Active Units",
      value: active,
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100/50 dark:border-emerald-900/50",
    },
    {
      title: "System Units",
      value: system,
      icon: Shield,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/60 border-blue-100/50 dark:border-blue-900/50",
    },
    {
      title: "Custom Units",
      value: custom,
      icon: User,
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/60 border-orange-100/50 dark:border-orange-900/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition duration-200"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${card.bgColor}`}
            >
              <Icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {card.title}
              </p>
              <p className="mt-1 text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">
                {card.value}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default UnitSummary;
