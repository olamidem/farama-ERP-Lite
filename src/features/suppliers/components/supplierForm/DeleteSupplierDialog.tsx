import { AlertCircle } from "lucide-react";

interface DeleteSupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  supplierName: string;
  isPending: boolean;
}

export default function DeleteSupplierDialog({
  isOpen,
  onClose,
  onConfirm,
  supplierName,
  isPending,
}: DeleteSupplierDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-100 dark:border-slate-800 z-10 animate-in fade-in zoom-in duration-200 transition-colors">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Delete Supplier?</h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="text-slate-800 dark:text-slate-200">"{supplierName}"</strong>? This
            will permanently remove them from the system. This action cannot be
            undone.
          </p>

          <div className="flex w-full gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 py-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm hover:shadow-rose-500/10 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Yes, Delete</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
