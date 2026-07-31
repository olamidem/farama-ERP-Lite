import type { Customer } from "../types/customer";
import type {
  CustomerWallet,
  WalletTransaction,
  WalletStatus,
} from "../types/wallet";
import type { Sale } from "../../sales/types/sale";
import CustomerFinancialDashboard from "./CustomerFinancialDashboard";

interface CustomerDetailDrawerProps {
  activeCustomer: Customer | null;
  activeWallet: CustomerWallet | undefined;
  activeWalletTransactions: WalletTransaction[];
  activeCustomerSales: Sale[];
  isLoadingSales: boolean;
  txFilterType: string;
  onTxFilterChange: (type: string) => void;
  onDeselect: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onDeposit: (customer: Customer) => void;
  onWithdraw: (customer: Customer) => void;
  onStatement: (customer: Customer) => void;
  onToggleStatus: (customerId: string, status: WalletStatus) => void;
}

export default function CustomerDetailDrawer(props: CustomerDetailDrawerProps) {
  return <CustomerFinancialDashboard {...props} />;
}
