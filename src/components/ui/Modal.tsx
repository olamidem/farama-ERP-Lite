import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface ModalProps {
  open: boolean;
  title: string | ReactNode;
  children: ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

const Modal = ({ open, title, children, onClose, size = "md" }: ModalProps) => {
  if (!open) return null;

  return (
    // Backdrop overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div
        className={cn(
          "bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 w-full flex flex-col max-h-[90vh] overflow-hidden transition-colors",
          sizes[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Stays Fixed) */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            {title}
          </span>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer p-0.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body (Scrolls if content overflows) */}
        <div className="px-6 py-5 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
