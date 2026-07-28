import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Check,
} from "lucide-react";

import { supabase } from "../../../api/supabase";
import { useAuthStore } from "../store/authStore";
import {
  setPasswordSchema,
  type SetPasswordFormData,
} from "../validation/setPasswordSchema";
import bgImage from "../../../assets/this.png";

const passwordRules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "One number", test: (v: string) => /[0-9]/.test(v) },
];

const SetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const initialize = useAuthStore((s) => s.initialize);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const watchedPassword = watch("password", "");

  const onSubmit = async (data: SetPasswordFormData) => {
    setIsSubmitting(true);

    try {
      // 1. Update Supabase Auth password
      const { error: authError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // 2. Get current user id
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Could not retrieve user after password update.");
      }

      // 3. Mark profile as activated
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          password_set: true,
          status: "ACTIVE",
          activated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      // 4. Refresh auth state
      await initialize();

      toast.success("Password set successfully! Welcome aboard.");
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to set password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* LEFT PANE */}
      <div className="w-full md:w-[45%] bg-white flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-24 py-12 relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-100/30 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="max-w-md w-full mx-auto space-y-8 relative z-10">
          {/* Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-linear-to-r from-emerald-600 to-blue-600 rounded-2xl blur-md opacity-30" />
                <div className="relative w-14 h-14 rounded-2xl bg-linear-to-br from-slate-900 via-slate-950 to-emerald-950 flex items-center justify-center border border-white/10 shadow-lg text-white font-black text-lg tracking-wider">
                  FM
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none">
                  FARAMA STORE
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Set your new password to activate your account
            </p>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.section
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
            >
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* New Password */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                      className={`w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-12 text-sm text-slate-800 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
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
                      <p className="text-xs font-medium">
                        {errors.password.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      className={`w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-12 text-sm text-slate-800 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.confirmPassword
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center gap-1 text-red-500 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <p className="text-xs font-medium">
                        {errors.confirmPassword.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Password strength checklist */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Password Requirements
                  </p>
                  {passwordRules.map((rule) => {
                    const passes = rule.test(watchedPassword);
                    return (
                      <div
                        key={rule.label}
                        className="flex items-center gap-2"
                      >
                        <div
                          className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${
                            passes
                              ? "bg-emerald-500"
                              : "bg-slate-200"
                          }`}
                        >
                          {passes && (
                            <Check className="h-2.5 w-2.5 text-white" />
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium transition-colors ${
                            passes
                              ? "text-emerald-700"
                              : "text-slate-400"
                          }`}
                        >
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Setting Password...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Set Password & Activate Account</span>
                    </>
                  )}
                </button>
              </form>
            </motion.section>
          </AnimatePresence>

          {/* Footer */}
          <div className="border-t border-slate-100 pt-6 text-center text-slate-400 text-[11px] font-medium">
            <p>© 2026 Farama Store. All Rights Reserved.</p>
            <p className="mt-0.5">Authorized Store Personnel Only.</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="hidden md:block md:w-[55%] relative overflow-hidden bg-slate-900">
        <div className="absolute top-0 bottom-0 left-0 w-16 bg-white transform -skew-x-6 -translate-x-8 z-10" />
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

export default SetPasswordPage;
