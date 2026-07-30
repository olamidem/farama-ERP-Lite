import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../context/useThems";
import type { Theme } from "../../context/ThemeContext";

interface ThemeSwitcherProps {
  className?: string;
  variant?: "segmented" | "compact";
}

export const ThemeSwitcher = ({
  className = "",
  variant = "segmented",
}: ThemeSwitcherProps) => {
  const { theme, setTheme } = useTheme();

  const options: Array<{ id: Theme; label: string; icon: typeof Sun }> = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 ${className}`}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              title={`Switch to ${opt.label} mode`}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 ${className}`}>
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
            <span className="capitalize">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSwitcher;
