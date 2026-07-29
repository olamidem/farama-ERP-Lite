import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import UnitForm from "./UnitForm";
import { useUpdateUnit } from "../hooks/useUnitMutations";
import type { Unit } from "../types/unit";
import type { UnitFormData } from "../validation/unit.schema";

interface EditUnitPanelProps {
  open: boolean;
  onClose: () => void;
  unit: Unit | null;
}

export const EditUnitPanel = ({ open, onClose, unit }: EditUnitPanelProps) => {
  const { mutateAsync: updateUnit, isPending } = useUpdateUnit();

  if (!unit) return null;

  const handleSubmit = async (data: UnitFormData) => {
    await updateUnit({ id: unit.id, unit: data });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          />

          {/* Slide over */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white dark:bg-slate-900 p-6 shadow-2xl flex flex-col border-l border-slate-100 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight uppercase">
                  Edit Unit: {unit.name}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Modify the configuration of this unit of measurement.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pr-1">
              <UnitForm
                defaultValues={{
                  name: unit.name,
                  symbol: unit.symbol,
                   description: unit.description ?? undefined,
                  is_active: unit.is_active,
                }}
                submitLabel="Save Changes"
                loading={isPending}
                onCancel={onClose}
                onSubmit={handleSubmit}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditUnitPanel;
