import CustomerModal from "./CustomerModal";
import DeleteCustomerModal from "./DeleteCustomerModal";
import TopUpModal from "./TopUpModal";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";
import WalletStatementModal from "./WalletStatementModal";

import type { Customer } from "../types/customer";
import type { CustomerFormInput, TopUpFormInput } from "../validation/customer.schema";

interface CustomerModalsContainerProps {
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
  onCloseCustomerModal: () => void;
  onCloseDeleteModal: () => void;
  onCloseTopUpModal: () => void;
  onCloseDepositModal: () => void;
  onCloseWithdrawModal: () => void;
  onCloseStatementModal: () => void;
  onSaveCustomer: (data: CustomerFormInput) => Promise<void>;
  onPostLedger: (data: TopUpFormInput) => Promise<void>;
  onCustomerDeleted: () => void;
  isSavingCustomer?: boolean;
  isPostingLedger?: boolean;
}

export default function CustomerModalsContainer({
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
      <CustomerModal
        isOpen={isModalOpen}
        onClose={onCloseCustomerModal}
        customer={selectedCustomerToEdit}
        onSave={onSaveCustomer}
        isLoading={isSavingCustomer}
      />

      <DeleteCustomerModal
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        customer={customerToDelete}
        onDeleted={onCustomerDeleted}
      />

      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={onCloseTopUpModal}
        customer={customerToTopUp}
        onSave={onPostLedger}
        isLoading={isPostingLedger}
      />

      <DepositModal
        isOpen={isDepositOpen}
        onClose={onCloseDepositModal}
        customer={depositCustomer}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={onCloseWithdrawModal}
        customer={withdrawCustomer}
      />

      <WalletStatementModal
        isOpen={isStatementOpen}
        onClose={onCloseStatementModal}
        customer={statementCustomer}
      />
    </>
  );
}
