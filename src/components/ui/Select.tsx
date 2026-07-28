import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

interface Option {
  label: string;
  value: string;
}

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      placeholder = "Select an option",
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "h-10 w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-4 pr-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
            className
          )}
          {...props}
        >
         {placeholder && <option value="" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
            {placeholder}
          </option>}

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        />
      </div>
    );
  }
);
Select.displayName = "Select";

export default Select;