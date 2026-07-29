import { useState, useEffect } from "react";
import PurchaseStats from "../components/PurchaseStats";
import PurchaseFilters from "../components/PurchaseFilters";
import PurchaseTable from "../components/PurchaseTable";
import PurchaseOverview from "../components/PurchaseDetails/PurchaseOverview";
import PurchaseOverviewSkeleton from "../components/PurchaseDetails/PurchaseOverviewSkeleton";
import PurchaseForm from "../components/PurchaseForm/PurchaseForm";
import type { Purchase } from "../types/purchase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X } from "lucide-react";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { usePurchases } from "../hook/usePurchases";
import { useDeletePurchase } from "../hook/usePurchasesMutations";

export const PurchasesPage = () => {
  const deleteMutation = useDeletePurchase();

  // Filters State
  const [search, setSearch] = useState("");
  const [supplierId, setSupplierId] = useState("all");
  const [status, setStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Selection State
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null,
  );
  const [isClosedManually, setIsClosedManually] = useState(true);
  const [purchaseToDeleteId, setPurchaseToDeleteId] = useState<string | null>(
    null,
  );
  const [purchaseToEdit, setPurchaseToEdit] = useState<Purchase | null>(null);

  // Modal State for New Purchase Order
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Auto-open create modal if productId search param exists
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("productId")) {
      setTimeout(() => {
        setIsCreateModalOpen(true);
      }, 0);
    }
  }, []);

  // Load purchase orders list
  const { data: allPurchases = [], isLoading, refetch } = usePurchases();

  // Client-side filtering
  const purchases = (allPurchases || []).filter((purchase) => {
    const matchesSearch =
      search === "" ||
      (purchase.purchase_number || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (purchase.supplier?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesSupplier =
      supplierId === "all" || purchase.supplier_id === supplierId;

    const matchesStatus = status === "all" || purchase.status === status;

    const matchesDate = (() => {
      if (dateFilter === "all") return true;
      const purchaseDate = new Date(purchase.purchase_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === "today") {
        const d = new Date(purchaseDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      }
      if (dateFilter === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const d = new Date(purchaseDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === yesterday.getTime();
      }
      if (dateFilter === "last7") {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return purchaseDate >= sevenDaysAgo;
      }
      if (dateFilter === "last30") {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return purchaseDate >= thirtyDaysAgo;
      }
      return true;
    })();

    return matchesSearch && matchesSupplier && matchesStatus && matchesDate;
  });

  const handleFilterClick = () => {
    if (
      search !== "" ||
      supplierId !== "all" ||
      status !== "all" ||
      dateFilter !== "all"
    ) {
      setSearch("");
      setSupplierId("all");
      setStatus("all");
      setDateFilter("all");
      toast.success("Filters cleared.");
    } else {
      toast.info("No active filters to clear.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      if (selectedPurchase?.id === id) {
        setSelectedPurchase(null);
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to delete purchase order.");
    }
  };

  const handleEdit = (purchase: Purchase) => {
    if (purchase.status !== "PENDING") {
      toast.error("Editing is restricted to Pending purchases only.");
      return;
    }
    setPurchaseToEdit(purchase);
  };

  const handleExport = () => {
    if (purchases.length === 0) {
      toast.error("No purchase orders to export.");
      return;
    }
    const headers = [
      "PO Number",
      "Supplier",
      "Purchase Date",
      "Expected Delivery Date",
      "Total Amount",
      "Status",
      "Received %",
    ];
    const rows = purchases.map((p) => [
      p.purchase_number,
      p.supplier?.name || "Unknown",
      p.purchase_date,
      p.expected_delivery_date || "",
      p.total_amount,
      p.status,
      p.received_percentage || 0,
    ]);
    const csvContent = [headers, ...rows]
      .map((e) =>
        e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `purchase_orders_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Purchase orders CSV report exported successfully.");
  };

  // Find fresh data for selected purchase (to reflect receives, status changes instantly)
  // Auto-preselect first item to replicate split-screen default view unless closed manually
  const activeSelected = isClosedManually
    ? null
    : selectedPurchase
      ? purchases.find((p) => p.id === selectedPurchase.id) || selectedPurchase
      : purchases.length > 0
        ? purchases[0]
        : null;

  return (
    <div className="w-full h-full space-y-6">
      {/* Top action row containing "+ New Purchase Order" button right aligned */}
      <div className="flex justify-end items-center shrink-0">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          type="button"
          className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold transition shadow-sm cursor-pointer border-0 shrink-0"
        >
          <Plus size={15} />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* Main split-view or full-width grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: KPI cards, Filters, Table */}
        <div
          className={`${isLoading || activeSelected ? "lg:col-span-7" : "lg:col-span-12"} space-y-6 transition-all duration-300`}
        >
          <PurchaseStats />

          <PurchaseFilters
            search={search}
            setSearch={setSearch}
            supplierId={supplierId}
            setSupplierId={setSupplierId}
            status={status}
            setStatus={setStatus}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            onFilterClick={handleFilterClick}
            onExport={handleExport}
          />

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4.5 shadow-3xs transition-colors">
            <PurchaseTable
              purchases={purchases}
              isLoading={isLoading}
              onView={(p) => {
                setSelectedPurchase(p);
                setIsClosedManually(false);
              }}
              onEdit={handleEdit}
              onDelete={(id) => setPurchaseToDeleteId(id)}
              isCompact={false}
            />
          </div>
        </div>

        {/* Right Column: Selected Purchase Order Detail view or loading skeleton */}
        {(isLoading || activeSelected) && (
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md lg:h-[calc(100vh-140px)] lg:sticky lg:top-4 z-20 flex flex-col transition-colors">
            {isLoading ? (
              <PurchaseOverviewSkeleton />
            ) : activeSelected ? (
              <PurchaseOverview
                key={activeSelected.id}
                purchase={activeSelected}
                onClose={() => {
                  setSelectedPurchase(null);
                  setIsClosedManually(true);
                }}
                onEdit={handleEdit}
              />
            ) : null}
          </div>
        )}
      </div>

      {/* New Purchase Order Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-slate-50 dark:bg-slate-900 w-full max-w-6xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors"
            >
              {/* Modal Sticky Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      New Purchase Order
                    </h2>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                      Create and register a new purchase requisition with
                      suppliers
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition border-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/50">
                <PurchaseForm
                  isModal={true}
                  onSuccess={() => {
                    setIsCreateModalOpen(false);
                    refetch();
                  }}
                  onCancel={() => setIsCreateModalOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Purchase Order Modal */}
      <AnimatePresence>
        {purchaseToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-slate-50 dark:bg-slate-900 w-full max-w-6xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors"
            >
              {/* Modal Sticky Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      Edit Purchase Order
                    </h2>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                      Update details of your pending purchase requisition
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPurchaseToEdit(null)}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition border-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/50">
                <PurchaseForm
                  purchase={purchaseToEdit}
                  isModal={true}
                  onSuccess={() => {
                    setPurchaseToEdit(null);
                    refetch();
                  }}
                  onCancel={() => setPurchaseToEdit(null)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!purchaseToDeleteId}
        title="Delete Purchase Order"
        subtitle="This action is permanent"
        description="Are you sure you want to delete this purchase order? This will permanently remove the record from the database."
        confirmationKeyword="DELETE"
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteMutation.isPending}
        onCancel={() => setPurchaseToDeleteId(null)}
        onConfirm={async () => {
          if (purchaseToDeleteId) {
            await handleDelete(purchaseToDeleteId);
            setPurchaseToDeleteId(null);
          }
        }}
      />
    </div>
  );
};

export default PurchasesPage;
