import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { useDeleteCustomer } from "../hooks/useCustomerMutations";
import type { Customer } from "../types/customer";

export interface DeleteCustomerModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  customer: Customer | null;
  onDeleted?: () => void;
}

export const DeleteCustomerModal = ({
  isOpen,
  open,
  onClose,
  customer,
  onDeleted,
}: DeleteCustomerModalProps) => {
  const { mutateAsync: deleteCustomer, isPending } = useDeleteCustomer();

  if (!customer) return null;

  const handleConfirm = async () => {
    try {
      await deleteCustomer(customer.id);
      if (onDeleted) onDeleted();
      onClose();
    } catch {
      // Error toast is handled inside the hook
    }
  };

  const isModalVisible = Boolean(isOpen ?? open);

  return (
    <ConfirmDialog
      open={isModalVisible}
      title="Delete Customer Profile"
      subtitle="Verify action"
      variant="danger"
      confirmText="Delete Customer"
      cancelText="Cancel"
      loading={isPending}
      onCancel={onClose}
      onConfirm={handleConfirm}
      description={`Are you sure you want to permanently delete customer profile "${customer.name}"?`}
      infoBoxText="Deleting this customer profile will permanently remove their record from your database registry."
    />
  );
};

export default DeleteCustomerModal;
