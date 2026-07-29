import type { Customer } from "../types/customer";
import CustomerModal from "./CustomerModal";
import TopUpModal from "./TopUpModal";
import DeleteCustomerModal from "./DeleteCustomerModal";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";
import WalletStatementModal from "./WalletStatementModal";

interface CustomerModalsContainerProps {
  // Modal states
  isModalOpen: boolean;
  selectedCustomerToEdit: Customer | null;
  isDeleteModalOpen: boolean;
  customerToDelete: Customer | null;
  isTopUpOpen: boolean;
  customerToTopUp: Customer | null;
  isDepositOpen: boolean;
  depositCustomer: Customer | null;
  isWithdrawOpen: boolean;
  withdrawCustomer: Customer | null;
  isStatementOpen: boolean;
  statementCustomer: Customer | null;

  // Close handlers
  onCloseCustomerModal: () => void;
  onCloseDeleteModal: () => void;
  onCloseTopUpModal: () => void;
  onCloseDepositModal: () => void;
  onCloseWithdrawModal: () => void;
  onCloseStatementModal: () => void;

  // Action submission handlers
  onSaveCustomer: (data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    remarks?: string;
  }) => Promise<void>;
  onPostLedger: (data: {
    type: "TOP_UP" | "PAYMENT" | "DEBIT";
    amount: number;
    remarks?: string;
  }) => Promise<void>;
  onCustomerDeleted: () => void;

  // Loading states
  isSavingCustomer: boolean;
  isPostingLedger: boolean;
}

export function CustomerModalsContainer({
  isModalOpen,
  selectedCustomerToEdit,
  isDeleteModalOpen,
  customerToDelete,
  isTopUpOpen,
  customerToTopUp,
  isDepositOpen,
  depositCustomer,
  isWithdrawOpen,
  withdrawCustomer,
  isStatementOpen,
  statementCustomer,
  onCloseCustomerModal,
  onCloseDeleteModal,
  onCloseTopUpModal,
  onCloseDepositModal,
  onCloseWithdrawModal,
  onCloseStatementModal,
  onSaveCustomer,
  onPostLedger,
  onCustomerDeleted,
  isSavingCustomer,
  isPostingLedger,
}: CustomerModalsContainerProps) {
  return (
    <>
      {/* Customer Create/Edit Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={onCloseCustomerModal}
        customer={selectedCustomerToEdit}
        onSave={onSaveCustomer}
        isLoading={isSavingCustomer}
      />

      {/* Wallet balance top up / post ledger action modal */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={onCloseTopUpModal}
        customer={customerToTopUp}
        onSave={onPostLedger}
        isLoading={isPostingLedger}
      />

      {/* Delete Customer Confirmation Modal */}
      <DeleteCustomerModal
        open={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        customer={customerToDelete}
        onDeleted={onCustomerDeleted}
      />

      {/* Dedicated Wallet Deposit Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={onCloseDepositModal}
        customer={depositCustomer}
      />

      {/* Dedicated Wallet Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={onCloseWithdrawModal}
        customer={withdrawCustomer}
      />

      {/* Printable Customer Wallet Statement Modal */}
      <WalletStatementModal
        isOpen={isStatementOpen}
        onClose={onCloseStatementModal}
        customer={statementCustomer}
      />
    </>
  );
}

export default CustomerModalsContainer;
