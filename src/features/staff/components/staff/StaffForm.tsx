import { useState } from "react";
import type { Employee, RoleData } from "../types";

interface StaffFormProps {
  initialData?: Partial<Employee>;
  roles: RoleData[];
  mode: "create" | "edit";
  onSubmit: (data: {
    full_name: string;
    email: string;
    phone: string;
    role: string;
    pin?: string;
    status?: "active" | "suspended";
  }) => void;
  onCancel: () => void;
  submitButtonText: string;
}

export const StaffForm = ({
  initialData,
  roles,
  mode,
  onSubmit,
  onCancel,
  submitButtonText,
}: StaffFormProps) => {
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    role: initialData?.role ?? roles[0]?.name ?? "Cashier",
    pin: initialData?.pin ?? "",
    status: (initialData?.status as "active" | "suspended") ?? "active",
  });

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePinChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      updateField("pin", value);
    }
  };

  const isFormValid =
    formData.full_name.trim().length > 1 &&
    formData.email.trim().length > 0 &&
    formData.role.trim().length > 0 &&
    (mode === "edit" || formData.pin.length >= 4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
    };

    if (mode === "create") {
      onSubmit({
        ...payload,
        pin: formData.pin,
      });
    } else {
      onSubmit({
        ...payload,
        status: formData.status,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div className="space-y-1 text-left">
        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          Full Name <span className="text-rose-500">*</span>
        </label>

        <input
          required
          autoComplete="off"
          type="text"
          placeholder="John Doe"
          value={formData.full_name}
          onChange={(e) => updateField("full_name", e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
        />
      </div>

      {/* Email */}
      <div className="space-y-1 text-left">
        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          Email Address <span className="text-rose-500">*</span>
        </label>

        <input
          required
          type="email"
          autoComplete="off"
          placeholder="staff@farama.com"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
        />
      </div>

      {/* Phone */}
      <div className="space-y-1 text-left">
        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          Phone Number
        </label>

        <input
          type="text"
          autoComplete="off"
          placeholder="+358 40 123 4567"
          value={formData.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Role */}
        <div className="space-y-1 text-left">
          <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Role Assignment
          </label>

          <select
            value={formData.role}
            onChange={(e) => updateField("role", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 cursor-pointer"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* PIN or Status */}
        {mode === "create" ? (
          <div className="space-y-1 text-left">
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Operator PIN <span className="text-rose-500">*</span>
            </label>

            <input
              required
              type="password"
              autoComplete="new-password"
              maxLength={6}
              placeholder="4–6 digits"
              value={formData.pin}
              onChange={(e) => handlePinChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-center text-xs font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>
        ) : (
          <div className="space-y-1 text-left">
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Access Status
            </label>

            <select
              value={formData.status}
              onChange={(e) =>
                updateField("status", e.target.value as "active" | "suspended")
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!isFormValid}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-indigo-600/10 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default StaffForm;
