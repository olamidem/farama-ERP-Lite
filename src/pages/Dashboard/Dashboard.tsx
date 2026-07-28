import { useAuthStore } from "../../store/authStore";

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  const userName =
    profile?.full_name ||
    (user?.user_metadata as Record<string, string>)?.full_name ||
    user?.email ||
    "User";

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
      <p className="text-slate-600 dark:text-slate-400">
        Welcome back,{" "}
        <span className="font-semibold text-slate-900 dark:text-slate-100">{userName}</span>
        👋
      </p>
      <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm transition-colors">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Farama Inventory Management System
        </h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Your dashboard is ready. Business insights, reports, inventory
          statistics, and recent activity will appear here as we build the
          application.
        </p>
      </div>
    </section>
  );
};
export default Dashboard;
