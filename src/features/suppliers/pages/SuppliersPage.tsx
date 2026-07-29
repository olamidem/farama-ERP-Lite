import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useSuppliers } from "../hooks/useSuppliers";
import {
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "../hooks/useSupplierMutations";
import type { SupplierWithStats, CreateSupplierInput } from "../types/supplier";
import SupplierTable from "../components/SupplierTable";
import EmptyState from "../components/EmptyState";
import SupplierDetails from "../components/supplierDetails/SupplierDetails";
import SupplierForm from "../components/supplierForm/SupplierForm";
import DeleteSupplierDialog from "../components/supplierForm/DeleteSupplierDialog";

export default function SuppliersPage() {
  const {
    data: suppliers = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSuppliers();

  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();
  const deleteSupplierMutation = useDeleteSupplier();

  const [selectedSupplierId, setSelectedSupplierId] = useState<
    string | undefined
  >(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<
    SupplierWithStats | undefined
  >(undefined);
  const [deletingSupplier, setDeletingSupplier] = useState<
    SupplierWithStats | undefined
  >(undefined);

  // Derived state to avoid synchronous state setting in useEffect
  const activeSupplierId =
    selectedSupplierId || (suppliers.length > 0 ? suppliers[0].id : undefined);
  const selectedSupplier = suppliers.find((s) => s.id === activeSupplierId);

  const handleCreateSubmit = async (payload: CreateSupplierInput) => {
    try {
      const created = await createSupplierMutation.mutateAsync(payload);
      setIsFormOpen(false);
      setSelectedSupplierId(created.id);
    } catch (err) {
      console.error("Failed to create supplier:", err);
    }
  };

  const handleEditSubmit = async (payload: CreateSupplierInput) => {
    if (!editingSupplier) return;
    try {
      await updateSupplierMutation.mutateAsync({
        id: editingSupplier.id,
        input: payload,
      });
      setIsFormOpen(false);
      setEditingSupplier(undefined);
    } catch (err) {
      console.error("Failed to edit supplier:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSupplier) return;
    try {
      await deleteSupplierMutation.mutateAsync(deletingSupplier.id);
      setDeletingSupplier(undefined);
      // Select another supplier or reset
      const remaining = suppliers.filter((s) => s.id !== deletingSupplier.id);
      if (remaining.length > 0) {
        setSelectedSupplierId(remaining[0].id);
      } else {
        setSelectedSupplierId(undefined);
      }
    } catch (err) {
      console.error("Failed to delete supplier:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Loading suppliers...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30 p-8 text-center max-w-xl mx-auto my-12">
        <h3 className="text-sm font-bold text-red-900 dark:text-red-300">
          Failed to load suppliers
        </h3>
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred while loading data."}
        </p>
        <button
          onClick={() => refetch()}
          type="button"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-600 dark:bg-red-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 dark:hover:bg-red-600 transition cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-120px)] flex flex-col overflow-hidden text-left">
      {suppliers.length === 0 ? (
        <div className="py-12 flex-1">
          <EmptyState
            title="Suppliers directory is empty"
            description="Register your business contacts and material vendors to connect purchase order logs dynamically."
            onAction={() => {
              setEditingSupplier(undefined);
              setIsFormOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
          {/* Left Column (Supplier Table / List) */}
          <div className="w-full lg:w-95 shrink-0 h-full flex flex-col">
            <SupplierTable
              suppliers={suppliers}
              selectedSupplierId={activeSupplierId}
              onSelectSupplier={(s) => setSelectedSupplierId(s.id)}
              onAddSupplier={() => {
                setEditingSupplier(undefined);
                setIsFormOpen(true);
              }}
            />
          </div>

          {/* Right Column (Supplier Details) */}
          <div className="flex-1 min-w-0 h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs p-6 flex flex-col overflow-hidden transition-colors">
            {selectedSupplier ? (
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pr-1">
                <SupplierDetails
                  supplier={selectedSupplier}
                  onEdit={() => {
                    setEditingSupplier(selectedSupplier);
                    setIsFormOpen(true);
                  }}
                  onDelete={() => setDeletingSupplier(selectedSupplier)}
                />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center p-8">
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  Select a supplier from the list on the left to review metrics
                  and history.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <SupplierForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSupplier(undefined);
        }}
        onSubmit={editingSupplier ? handleEditSubmit : handleCreateSubmit}
        supplier={editingSupplier}
        isPending={
          createSupplierMutation.isPending || updateSupplierMutation.isPending
        }
      />

      {/* Delete Confirmation Dialog */}
      <DeleteSupplierDialog
        isOpen={!!deletingSupplier}
        onClose={() => setDeletingSupplier(undefined)}
        onConfirm={handleDeleteConfirm}
        supplierName={deletingSupplier?.name || ""}
        isPending={deleteSupplierMutation.isPending}
      />
    </div>
  );
}
