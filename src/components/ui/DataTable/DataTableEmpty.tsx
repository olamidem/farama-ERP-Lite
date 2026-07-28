import type { LucideIcon } from "lucide-react";
import { Database } from "lucide-react";

interface DataTableEmptyProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
}

const DataTableEmpty = ({
  icon: Icon = Database,
  title = "No records found",
  description = "There is nothing to display yet.",
}: DataTableEmptyProps) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Icon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
};

export default DataTableEmpty;
