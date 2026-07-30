
import LoginForm from "../../features/auth/components/LoginForm";
import bgImage from "./../../assets/this.png";
import { AnimatePresence, motion } from "motion/react";
import ThemeSwitcher from "../../components/common/ThemeSwitcher";

const LoginScreen = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans overflow-hidden transition-colors">
      {/* LEFT PANE: LOGIN FORM */}
      <div className="w-full md:w-[45%] bg-white dark:bg-slate-900 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-24 py-12 relative transition-colors">
        {/* Top-right theme switcher floating on login pane */}
        <div className="absolute top-6 right-6 z-20">
          <ThemeSwitcher variant="compact" />
        </div>

        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100/30 dark:bg-blue-900/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-100/30 dark:bg-indigo-900/10 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="max-w-md w-full mx-auto space-y-8 relative z-10">
          {/* Logo Brand Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl blur-md opacity-30"></div>
                <div className="relative w-14 h-14 rounded-2xl bg-linear-to-br from-slate-900 via-slate-950 to-blue-950 flex items-center justify-center border border-white/10 shadow-lg text-white font-black text-lg tracking-wider">
                  FM
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                  FARAMA STORE
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Login to have access to your dashboard
            </p>
          </div>

          {/* Login Form */}
          <AnimatePresence mode="wait">
            <motion.section
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800/80 p-8 shadow-xl border border-slate-100 dark:border-slate-800"
            >
              <LoginForm />
            </motion.section>
          </AnimatePresence>

          {/* Footer branding */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 text-center text-slate-400 dark:text-slate-500 text-[11px] font-medium">
            <p>© 2026 Farama Store. All Rights Reserved.</p>
            <p className="mt-0.5">Authorized Store Personnel Only.</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: BEAUTIFUL GROCERY BANNER SPLIT */}
      <div className="hidden md:block md:w-[55%] relative overflow-hidden bg-slate-900">
        {/* Sleek diagonal split panel overlay */}
        <div className="absolute top-0 bottom-0 left-0 w-16 bg-white dark:bg-slate-900 transform -skew-x-6 -translate-x-8 z-10 transition-colors" />

        <img
          src={bgImage}
          alt="Farama Store Grocery"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-85 select-none"
        />
      </div>
    </div>
  );
};

export default LoginScreen;
