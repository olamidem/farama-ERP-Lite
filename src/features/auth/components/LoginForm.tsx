import { AlertCircle, Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginFormData } from "../validation/loginSchema";
import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuthStore } from "../store/authStore";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const onSubmit = async (data: LoginFormData) => {
    await loginMutation.mutateAsync(data);
    const profile = useAuthStore.getState().profile;

    if (profile && profile.password_set === false) {
      toast.info("Please set your new password to continue.");
      navigate({
        to: "/auth/set-password",
        replace: true,
      });
    } else {
      toast.success("Welcome back!");
      navigate({
        to: "/dashboard",
        replace: true,
      });
    }
  };

  
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
            Staff Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              placeholder="admin@mail.com"
              {...register("email")}
              className={`w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"}`}
            />
          </div>
          {errors.email && (
            <div className="flex items-center gap-1 text-red-500 mt-1">
              <AlertCircle className="h-3 w-3" />
              <p className="text-xs font-medium">{errors.email.message}</p>
            </div>
          )}
        </div>
        
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className={`w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-12 text-sm text-slate-800 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <div className="flex items-center gap-1 text-red-500 mt-1">
              <AlertCircle className="h-3 w-3" />
              <p className="text-xs font-medium">{errors.password.message}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            className="text-xs font-medium text-blue-600 hover:underline cursor-pointer bg-transparent border-0"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
         disabled={loginMutation.isPending || isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          {loginMutation.isPending ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
