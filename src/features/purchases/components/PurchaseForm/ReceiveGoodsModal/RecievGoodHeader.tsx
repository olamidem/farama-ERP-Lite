import { X, PackageOpen } from "lucide-react";

interface RecievGoodHeaderProps {
  purchaseNumber: string;
  onClose: () => void;
}

export const RecievGoodHeader = ({
  purchaseNumber,
  onClose,
}: RecievGoodHeaderProps) => {
  return (
    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
      <div className="flex items-center gap-2">
        <PackageOpen
          className="text-indigo-600 dark:text-indigo-400"
          size={18}
        />
        <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
          Receive Goods - {purchaseNumber}
        </span>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition shadow-none"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default RecievGoodHeader;
