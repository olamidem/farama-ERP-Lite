import { AlertTriangle, Archive } from "lucide-react";
import Modal from "../../../../components/ui/Modal";
import Button from "../../../../components/ui/Button";

interface ProductUnitDeleteDialogProps {
  open: boolean;
  unitSymbol: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ProductUnitDeleteDialog = ({
  open,
  unitSymbol,
  isPending,
  onCancel,
  onConfirm,
}: ProductUnitDeleteDialogProps) => {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      title={
        <div className="flex items-start gap-4 text-left normal-case tracking-normal">
          <span className="p-2 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight uppercase">
              Archive Selling Unit
            </h3>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              UOM Configuration
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          Are you sure you want to archive the selling unit configuration for{" "}
          <strong className="font-semibold text-slate-800 dark:text-slate-100">{unitSymbol}</strong>
          ?
        </p>

        <div className="py-2">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-150 dark:border-slate-700">
            Archiving this selling unit will hide it from the active pricing
            options in sales orders, but historical sales data referencing this
            packaging will remain preserved in logs and reports.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-6 py-4 -mx-6 -mb-5 mt-6">
          <Button variant="secondary" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            loading={isPending}
            onClick={onConfirm}
          >
            <Archive className="h-4 w-4" />
            Archive Unit
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductUnitDeleteDialog;
