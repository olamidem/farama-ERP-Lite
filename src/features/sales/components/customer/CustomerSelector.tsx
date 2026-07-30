import { User, Plus, Phone, Wallet } from "lucide-react";
import type { Customer } from "../../../customers/types/customer";
import { WALK_IN_CUSTOMER_ID } from "../../constants";
import { formatCurrency } from "../../utils/pricing";

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomerId: string;
  onSelectCustomer: (id: string) => void;
  onOpenAddCustomerModal?: () => void;
}

export const CustomerSelector = ({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onOpenAddCustomerModal,
}: CustomerSelectorProps) => {
  const activeCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-blue-500" />
          Customer
        </span>
        {onOpenAddCustomerModal && (
          <button
            type="button"
            onClick={onOpenAddCustomerModal}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        )}
      </div>

      <select
        value={selectedCustomerId}
        onChange={(e) => onSelectCustomer(e.target.value)}
        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
      >
        <option value={WALK_IN_CUSTOMER_ID}>Walk-in Customer (Guest)</option>
        {customers.map((cust) => (
          <option key={cust.id} value={cust.id}>
            {cust.name} {cust.phone ? `(${cust.phone})` : ""}
          </option>
        ))}
      </select>

      {activeCustomer && activeCustomer.id !== WALK_IN_CUSTOMER_ID && (
        <div className="flex items-center justify-between pt-1 text-xs text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            {activeCustomer.phone || "No phone"}
          </span>
          <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <Wallet className="w-3 h-3" />
            Wallet: {formatCurrency(activeCustomer.wallet_balance || 0)}
          </span>
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
