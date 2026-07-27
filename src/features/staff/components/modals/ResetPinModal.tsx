import { useState } from "react";
import type { Employee } from "../../types/staff";

interface ResetPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSubmit: (id: string, pin: string) => void;
}

export const ResetPinModal = ({
  isOpen,
  onClose,
  employee,
  onSubmit,
}: ResetPinModalProps) => {
  const [pin, setPin] = useState("");

  if (!isOpen || !employee) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(employee.id, pin);
    setPin("");
  };

  return (
    <div id="reset-pin-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-sm w-full overflow-hidden text-left">
        <div className="border-b border-slate-50 px-6 py-5 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Reset Security PIN</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-black cursor-pointer"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100/50 text-center">
            <p className="text-xs font-bold text-slate-700">Updating Terminal PIN for:</p>
            <p className="text-xs font-black text-indigo-700 mt-0.5">{employee.full_name}</p>
            <p className="text-[10px] font-bold text-slate-400">({employee.role?.name || "N/A"})</p>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">New Operator PIN *</label>
            <input
              required
              type="password"
              maxLength={6}
              placeholder="Enter 4-6 digit numeric code"
              value={pin}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) {
                  setPin(e.target.value);
                }
              }}
              className="w-full text-center rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
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
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-md"
            >
              Confirm Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
