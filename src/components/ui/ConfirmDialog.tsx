import { useState, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Info, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import Label from "./Label";

// 1. Define configuration mapping for different modal themes
const variantConfigs = {
  danger: {
    icon: AlertTriangle,
    iconBg: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400",
    subtitleText: "text-rose-700 dark:text-rose-400",
    buttonVariant: "danger" as const,
  },
  success: {
    icon: RefreshCw, // Or CheckCircle
    iconBg:
      "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
    subtitleText: "text-emerald-700 dark:text-emerald-400",
    buttonVariant: "primary" as const, // Adjust if your brand primary isn't green
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400",
    subtitleText: "text-blue-700 dark:text-blue-400",
    buttonVariant: "primary" as const,
  },
};

interface ConfirmDialogProps {
  open: boolean;
  title: string; // Keeps the main text customizable
  subtitle?: string;
  description?: string;
  infoBoxText?: string; // Captures your unique gray card paragraph text
  confirmationKeyword?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  variant?: "danger" | "success" | "info"; // Adds flexibility for "Restore", "Delete", etc.
  onCancel: () => void;
  onConfirm: () => void;
  children?: ReactNode;
}

const ConfirmDialog = ({
  open,
  title,
  subtitle,
  description,
  infoBoxText,
  confirmationKeyword = "DELETE",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  variant = "danger",
  onCancel,
  onConfirm,
  children,
}: ConfirmDialogProps) => {
  const [confirmationText, setConfirmationText] = useState("");

  if (!open) return null;

  // Extract styles based on your active variant
  const config = variantConfigs[variant];
  const IconComponent = config.icon;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      title={
        <div className="flex items-start gap-4 text-left normal-case tracking-normal">
          <span
            className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${config.iconBg}`}
          >
            <IconComponent className="w-5 h-5" />
          </span>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight uppercase">
              {title}
            </h3>
            {subtitle && (
              <p
                className={`mt-0.5 text-[10px] font-bold uppercase tracking-wider ${config.subtitleText}`}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      }
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="overflow-hidden bg-white dark:bg-slate-900"
        >
          {description && (
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {description}
            </p>
          )}

          {/* Shaded informational box */}
          {infoBoxText && (
            <div className="py-4">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-150 dark:border-slate-700">
                {infoBoxText}
              </p>
            </div>
          )}

          {/* Body content slot */}
          <div className="space-y-5 bg-white dark:bg-slate-900">
            {children}

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Type{" "}
                <span
                  className={`font-mono font-extrabold ${variant === "danger" ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
                >
                  {confirmationKeyword}
                </span>{" "}
                to confirm
              </Label>

              <Input
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={`Type ${confirmationKeyword}`}
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Footer controls (Bleeds perfectly flush down inside Modal) */}
          <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-6 py-4 -mx-6 -mb-5 mt-6">
            <Button variant="secondary" onClick={onCancel} disabled={loading}>
              {cancelText}
            </Button>

            <Button
              variant={config.buttonVariant}
              loading={loading}
              disabled={confirmationText.trim() !== confirmationKeyword}
              onClick={onConfirm}
            >
              {variant === "danger" && <Trash2 className="h-4 w-4" />}
              {confirmText}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
};

export default ConfirmDialog;
