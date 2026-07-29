import { useEffect } from "react";
import { X, Users, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  supplierSchema,
  type SupplierFormData,
} from "../../validations/supplierSchema";
import type {
  SupplierWithStats,
  CreateSupplierInput,
} from "../../types/supplier";
import SupplierBasicInformation from "./SupplierBasicInformation";
import SupplierContactInformation from "./SupplierContactInformation";
import SupplierNotes from "./SupplierNotes";
import { serializeSupplierRemarks } from "../../utils/supplierHelpers";

interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSupplierInput) => void;
  supplier?: SupplierWithStats;
  isPending: boolean;
}

export default function SupplierForm({
  isOpen,
  onClose,
  onSubmit,
  supplier,
  isPending,
}: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      contact_person: "",
      remarks_text: "",
    },
  });

  // Pre-fill form when supplier changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        reset({
          name: supplier.name,
          email: supplier.email || "",
          phone: supplier.phone || "",
          address: supplier.address || "",
          contact_person: supplier.contact_person || "",
          remarks_text: supplier.remarks_text || "",
        });
      } else {
        reset({
          name: "",
          email: "",
          phone: "",
          address: "",
          contact_person: "",
          remarks_text: "",
        });
      }
    }
  }, [isOpen, supplier, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = (data: SupplierFormData) => {
    // Serialize extra fields into the remarks column
    const remarks = serializeSupplierRemarks(
      data.remarks_text || "",
      data.contact_person || "",
    );

    const payload: CreateSupplierInput = {
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      remarks: remarks,
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-100 dark:border-slate-800 z-10 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                {supplier ? "Edit Supplier" : "Add Supplier"}
              </h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                {supplier
                  ? "Update existing supplier details"
                  : "Register a new vendor in the system"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
            title="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex-1 overflow-y-auto py-5 space-y-6 pr-1"
        >
          {Object.keys(errors).length > 0 && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/50 p-3.5 border border-red-100/50 dark:border-red-900/50 flex gap-2.5 text-left shrink-0">
              <AlertCircle className="h-4.5 w-4.5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-800 dark:text-red-300">
                  Please correct the form errors
                </h4>
                <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 font-semibold">
                  Ensure all mandatory fields are filled out and email address
                  format is valid.
                </p>
              </div>
            </div>
          )}

          {/* Basic Section */}
          <SupplierBasicInformation register={register} errors={errors} />

          {/* Contact Section */}
          <SupplierContactInformation register={register} errors={errors} />

          {/* Notes Section */}
          <SupplierNotes register={register} />

          {/* Footer Actions */}
          <div className="flex gap-3 pt-5 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm hover:shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{supplier ? "Save Changes" : "Register Supplier"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
