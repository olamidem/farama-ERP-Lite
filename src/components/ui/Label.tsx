import type { LabelHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

const Label = ({
  className,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      className={cn(
        "mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
};

export default Label;
