import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { useDeleteCustomer } from "../hooks/useCustomerMutations";
import type { Customer } from "../types/customer";

interface DeleteCustomerModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  onDeleted?: () => void;
}

export default function DeleteCustomerModal({
  open,
  onClose,
  customer,
  onDeleted,
}: DeleteCustomerModalProps) {
  const { mutateAsync: deleteCustomer, isPending } = useDeleteCustomer();

  if (!customer) return null;

  const handleDelete = async () => {
    try {
      await deleteCustomer(customer.id);
      onDeleted?.();
      onClose();
    } catch {
      // Error toast handled in mutation hook
    }
  };

  return (
    <ConfirmDialog
      open={open}
      variant="danger"
      loading={isPending}
      title="Delete Customer"
      subtitle="Permanent Action"
      description={`Are you sure you want to permanently delete "${customer.name}"?`}
      infoBoxText="This customer profile, wallet, and wallet transaction history will be permanently removed. This action cannot be undone."
      confirmText="Delete Customer"
      cancelText="Cancel"
      onConfirm={handleDelete}
      onCancel={onClose}
    />
  );
}
