import LoginForm from "../components/LoginForm";
import { Store } from "lucide-react";
import ThemeSwitcher from "../../../components/common/ThemeSwitcher";

export const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans select-none relative overflow-hidden transition-colors">
      <div className="absolute top-6 right-6 z-20">
        <ThemeSwitcher variant="compact" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.04),transparent)] dark:bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.04),transparent)] dark:bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent)] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl relative z-10 transition-colors">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm mb-4">
            <Store size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Farama Store POS
          </h2>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
            Operator Access Portal
          </p>
        </div>

        <LoginForm />

        <div className="text-center pt-2">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wide">
            FARAMA RETAIL SYSTEMS v2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
