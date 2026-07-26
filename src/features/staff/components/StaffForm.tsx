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
  const [fullName, setFullName] = useState(initialData?.full_name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [role, setRole] = useState(
    initialData?.role || roles[0]?.name || "Cashier",
  );
  const [pin, setPin] = useState(initialData?.pin_hash || "");
  const [status, setStatus] = useState<"active" | "suspended">(
    initialData?.status === "suspended" ? "suspended" : "active",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "create") {
      onSubmit({ full_name: fullName, email, phone, role, pin });
    } else {
      onSubmit({ full_name: fullName, email, phone, role, status });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="space-y-1 text-left">
        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
          Full Name *
        </label>
        <input
          required
          type="text"
          placeholder="Employee's Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
        />
      </div>

      <div className="space-y-1 text-left">
        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
          Email Address *
        </label>
        <input
          required
          type="email"
          placeholder="staff@farama.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
        />
      </div>

      <div className="space-y-1 text-left">
        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
          Phone Number
        </label>
        <input
          type="text"
          placeholder="+44 7911 123456"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-left">
        <div className="space-y-1">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            Role Assignment
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {mode === "create" ? (
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Operator PIN *
            </label>
            <input
              required
              type="password"
              maxLength={6}
              placeholder="4 to 6 digit PIN"
              value={pin}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) {
                  setPin(e.target.value);
                }
              }}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>
        ) : (
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Access Status *
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "active" | "suspended")
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-50 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-indigo-600/10"
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  );
};
