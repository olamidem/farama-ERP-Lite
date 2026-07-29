import { AlertTriangle } from "lucide-react";

interface DeleteStaffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteStaffDialog = ({
  isOpen,
  onClose,
  employeeName,
  onConfirm,
  isDeleting = false,
}: DeleteStaffDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-100 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-sm w-full overflow-hidden text-left p-6 space-y-6 transition-colors">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Delete Staff Member
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Are you sure you want to remove <strong className="text-slate-800 dark:text-slate-200">{employeeName}</strong>?
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl leading-relaxed">
          This operation is permanent. This profile and terminal credentials will be deleted from the system immediately.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-rose-600/10 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
