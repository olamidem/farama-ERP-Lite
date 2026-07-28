import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "../../utils/cn";

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export default Input;
