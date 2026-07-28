import React, { useState } from "react";
import { Key, Eye, EyeOff } from "lucide-react";
import type { Employee } from "../../types/staff";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSubmit: (profileId: string, newPassword: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const ChangePasswordModal = ({
  isOpen,
  onClose,
  employee,
  onSubmit,
  isSubmitting = false,
}: ChangePasswordModalProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await onSubmit(employee.id, password);
      setPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to change password.",
      );
    }
  };

  return (
    <div
      id="change-password-modal"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-100 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-sm w-full overflow-hidden text-left">
        <div className="border-b border-slate-50 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <Key size={18} className="text-indigo-600" />
            <h3 className="text-sm font-black uppercase tracking-wider">
              Change Password
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 font-black cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100/50 text-center">
            <p className="text-xs font-bold text-slate-700">
              Updating Password for:
            </p>
            <p className="text-xs font-black text-indigo-700 mt-0.5">
              {employee.full_name}
            </p>
            <p className="text-[10px] font-bold text-slate-400">
              ({employee.email})
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              New Password *
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/15 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Confirm New Password *
            </label>
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>

          <div className="pt-4 border-t border-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-indigo-200"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
