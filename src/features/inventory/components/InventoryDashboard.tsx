import { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Sliders,
  CheckSquare,
  ArrowLeftRight,
  Play,
  BookOpen,
  BarChart3,
  AlertTriangle,
  Settings,
  X,
  RefreshCw,
  FileText,
  Plus,
  ChevronDown,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../../lib/queryKey";
import { cn } from "../../../utils/cn";
import { motion, AnimatePresence } from "motion/react";
import InventorySummaryCards from "./cards/InventorySummaryCards";
import InventoryTransactionsTable from "./tables/InventoryTransactionsTable";
import StockAdjustmentModal from "./StockAdjustmentModal";
import { SalesHistoryPanel } from "./SalesHistoryPanel";
import {
  useInventorySummary,
  useProductStockOverview,
} from "../hooks/useInventory";
import { useInventoryTransactions } from "../hooks/useInventoryTransactions";
import type { InventoryTransactionWithRelations } from "../types/inventoryTransaction";
import { OpeningStockFormPanel } from "./OpeningStockFormPanel";
import { StockTransferFormPanel } from "./StockTransferFormPanel";
import type { InventorySettings } from "../types/inventory";
import StockCountPanel from "./StockCountPanel";
import ProductLedgerPanel from "./ProductLedgerPanel";
import {
  InventoryReportsPanel,
  InventorySettingsFormPanel,
  LowStockAlertsPanel,
} from "./InventoryReportsAndAlerts";
import { useCreateStockAdjustment } from "../hooks/useInventoryMutations";

export const InventoryDashboard = () => {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<
    | "dashboard"
    | "sales_history"
    | "count"
    | "transfer"
    | "opening"
    | "ledger"
    | "reports"
    | "alerts"
    | "settings"
  >("dashboard");

  // Selection Detail Overlays
  const [selectedTx, setSelectedTx] =
    useState<InventoryTransactionWithRelations | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Queries
  const { data: summary, isLoading: isLoadingSummary } = useInventorySummary();
  const { data: stockOverview = [], isLoading: isLoadingOverview } =
    useProductStockOverview();
  const { data: transactions = [], isLoading: isLoadingTx } =
    useInventoryTransactions();

  // Create adjustment mutation
  const createAdjustmentMutation = useCreateStockAdjustment();

  // Refresher
  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products }),
    ]);
    toast.success("Inventory records refreshed in real time");
  };

  // Unique product list mapping
  const productsList = useMemo(() => {
    const list = new Map<string, { name: string; sku: string }>();
    stockOverview.forEach((item) => {
      list.set(item.id, { name: item.name, sku: item.sku });
    });
    return Array.from(list.entries()).map(([id, info]) => ({
      id,
      name: info.name,
      sku: info.sku,
    }));
  }, [stockOverview]);

  // Low stock counter
  const lowStockCount = useMemo(() => {
    return stockOverview.filter((item) => item.stock <= item.min_stock_alert)
      .length;
  }, [stockOverview]);

  // Settings from LocalStorage
  const [settings, setSettings] = useState<InventorySettings>(() => {
    const saved = localStorage.getItem("farama_inventory_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // use default
      }
    }
    return {
      defaultMinAlert: 5,
      refPrefix: "FARAMA",
      operatorName: "Admin Operator",
    };
  });

  const saveSettings = (newSettings: InventorySettings) => {
    setSettings(newSettings);
    localStorage.setItem(
      "farama_inventory_settings",
      JSON.stringify(newSettings),
    );
    toast.success("Inventory preferences updated successfully");
  };

  // Section items list for navigation
  const SECTIONS = [
    { id: "dashboard", label: "Overview Dashboard", icon: LayoutDashboard },
    { id: "sales_history", label: "Sales History", icon: ShoppingCart },
    { id: "count", label: "Stock Count (Audit)", icon: CheckSquare },
    { id: "ledger", label: "Product Ledger", icon: BookOpen },
    { id: "reports", label: "Inventory Reports", icon: BarChart3 },
    { id: "alerts", label: "Low Stock Alerts", icon: AlertTriangle },
    { id: "settings", label: "Inventory Settings", icon: Settings },
  ] as const;

  return (
    <div className="space-y-6 py-2 w-full">
      {/* Top Main Banner Header matching the picture */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Inventory
          </h1>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
            <span
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
              onClick={() => setActiveSection("dashboard")}
            >
              Dashboard
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-normal">/</span>
            <span className="text-slate-600 dark:text-slate-300">Inventory</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mockup Dropdown Button for Inventory Actions at top right */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold bg-[#4F46E5] hover:bg-indigo-700 text-white rounded-lg shadow-xs hover:shadow-md transition cursor-pointer"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Inventory Actions</span>
              <ChevronDown
                size={12}
                className={cn(
                  "ml-0.5 opacity-80 transition-transform duration-200",
                  isDropdownOpen && "rotate-180",
                )}
              />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl z-50 text-left">
                  <button
                    onClick={() => {
                      setIsAdjustModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition cursor-pointer"
                  >
                    <Sliders
                      size={14}
                      className="text-slate-400 group-hover:text-indigo-600"
                    />
                    <span>New Stock Adjustment</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsTransferModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition cursor-pointer"
                  >
                    <ArrowLeftRight
                      size={14}
                      className="text-slate-400 group-hover:text-purple-600"
                    />
                    <span>Stock Transfer</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsOpeningModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg transition cursor-pointer"
                  >
                    <Play
                      size={14}
                      className="text-slate-400 group-hover:text-amber-600"
                    />
                    <span>Opening Stock</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition shadow-xs hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer flex items-center justify-center"
            title="Refresh Real-time Data"
          >
            <RefreshCw size={14} className="animate-hover:spin" />
          </button>
        </div>
      </div>

      {/* Modern Top Horizontal Scrollable Tab Bar */}
      <div className="flex items-center border-b border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none gap-2 pb-px text-left">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all relative border-b-2 whitespace-nowrap cursor-pointer select-none pb-3.5",
                isActive
                  ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-extrabold"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  isActive ? "text-indigo-600 dark:text-indigo-400 scale-110" : "text-slate-400 dark:text-slate-500",
                )}
              />
              <span>{sec.label}</span>
              {sec.id === "alerts" && lowStockCount > 0 && (
                <span className="ml-1 bg-amber-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full ring-2 ring-amber-100 dark:ring-amber-900/50 animate-pulse">
                  {lowStockCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Global Stock Adjustment Modal Trigger */}
      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        productsList={productsList}
        stockOverview={stockOverview}
        settings={settings}
      />

      {/* Stock Transfer Modal */}
      <AnimatePresence>
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="relative w-full max-w-2xl rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-purple-50 dark:bg-purple-950/50 p-2.5 text-purple-600 dark:text-purple-400">
                    <ArrowLeftRight size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Inter-Warehouse Stock Transfer
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                      Record inward or outward movements of products between
                      channels.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTransferModalOpen(false)}
                  className="rounded-xl p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <StockTransferFormPanel
                productsList={productsList}
                stockOverview={stockOverview}
                settings={settings}
                onSubmit={async (payload) => {
                  await createAdjustmentMutation.mutateAsync(payload);
                  queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.inventory,
                  });
                  queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.products,
                  });
                  setIsTransferModalOpen(false);
                }}
                isPending={createAdjustmentMutation.isPending}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Opening Stock Modal */}
      <AnimatePresence>
        {isOpeningModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="relative w-full max-w-2xl rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/50 p-2.5 text-indigo-600 dark:text-indigo-400">
                    <Play size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Initialize Opening Stock
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                      Establish standard beginning physical counts for products.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpeningModalOpen(false)}
                  className="rounded-xl p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <OpeningStockFormPanel
                productsList={productsList}
                stockOverview={stockOverview}
                settings={settings}
                onSubmit={async (payload) => {
                  await createAdjustmentMutation.mutateAsync(payload);
                  queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.inventory,
                  });
                  queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.products,
                  });
                  setIsOpeningModalOpen(false);
                }}
                isPending={createAdjustmentMutation.isPending}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-Width Workspace Container */}
      <div className="w-full min-h-[calc(100vh-200px)] text-left">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full"
          >
            {activeSection === "dashboard" && (
              <div className="space-y-6">
                {/* 1. Summary Cards Row */}
                <InventorySummaryCards
                  summary={summary}
                  isLoading={isLoadingSummary}
                  transactions={transactions}
                />

                {/* 2. Main Full-Width Block: Transactions Table */}
                <div className="space-y-6">
                  {/* Recent Inventory Transactions table */}
                  <div id="inventory-transactions-table">
                    <InventoryTransactionsTable
                      transactions={transactions}
                      isLoading={isLoadingTx}
                      productsList={productsList}
                      onViewDetails={(tx) => setSelectedTx(tx)}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "sales_history" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-950 dark:text-slate-100">
                    Sales History & Invoices
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    Chronological list of all sales completed through client
                    channels.
                  </p>
                </div>
                <SalesHistoryPanel />
              </div>
            )}

            {activeSection === "count" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-950 dark:text-slate-100">
                    Physical Stock Count (Stock Take)
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    Input counted values to automatically adjust variances with
                    system values.
                  </p>
                </div>
                <StockCountPanel
                  stockOverview={stockOverview}
                  isLoading={isLoadingOverview}
                  settings={settings}
                  onCommitAdjustment={async (payload) => {
                    await createAdjustmentMutation.mutateAsync(payload);
                  }}
                  onComplete={() => {
                    queryClient.invalidateQueries({
                      queryKey: QUERY_KEYS.inventory,
                    });
                    queryClient.invalidateQueries({
                      queryKey: QUERY_KEYS.products,
                    });
                  }}
                />
              </div>
            )}

            {activeSection === "ledger" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-950 dark:text-slate-100">
                    Product Ledger Audit
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    View chronological stock transaction receipts for a specific
                    product item.
                  </p>
                </div>
                <ProductLedgerPanel
                  productsList={productsList}
                  transactions={transactions}
                  stockOverview={stockOverview}
                />
              </div>
            )}

            {activeSection === "reports" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-950 dark:text-slate-100">
                    Inventory Valuation & Reports
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    Visual graphs, metrics, and downloadable spreadsheet
                    templates.
                  </p>
                </div>
                <InventoryReportsPanel
                  transactions={transactions}
                  stockOverview={stockOverview}
                  summary={summary}
                />
              </div>
            )}

            {activeSection === "alerts" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-950 dark:text-slate-100 flex items-center gap-2">
                    <span>Low Stock Alert Center</span>
                    {lowStockCount > 0 && (
                      <span className="bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold px-2.5 py-0.5 border border-rose-200 dark:border-rose-900/50 rounded-full animate-bounce">
                        {lowStockCount} alert{lowStockCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    Catalogued products with physical stock levels below their
                    safety thresholds.
                  </p>
                </div>
                <LowStockAlertsPanel
                  stockOverview={stockOverview}
                  isLoading={isLoadingOverview}
                  onReplenish={() => setIsAdjustModalOpen(true)}
                />
              </div>
            )}

            {activeSection === "settings" && (
              <div className="max-w-xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-lg font-extrabold text-slate-950 dark:text-slate-100">
                    Inventory System Settings
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    Set default values for references, reorders, and logging
                    profiles.
                  </p>
                </div>
                <InventorySettingsFormPanel
                  settings={settings}
                  onSave={saveSettings}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide-over Transaction Detail Card */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-6 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 text-left">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/50 p-2 text-indigo-600 dark:text-indigo-400">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">
                    Transaction Details
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wide">
                    REF: {selectedTx.reference}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="rounded-xl p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-slate-700 dark:text-slate-300 text-left">
              <div className="flex justify-between items-start py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Product
                </span>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {selectedTx.product?.name || "Unknown Product"}
                  </p>
                  <p className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                    SKU: {selectedTx.product?.sku || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Type
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                  {selectedTx.transaction_type}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Timestamp
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {new Date(selectedTx.created_at).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Product Unit
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {selectedTx.product_unit?.unit?.name || "Piece"} (
                  {selectedTx.product_unit?.unit?.symbol || "pcs"})
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Quantity Change
                </span>
                <span
                  className={`font-mono text-xs font-extrabold ${
                    selectedTx.quantity > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {selectedTx.quantity > 0 ? "+" : ""}
                  {selectedTx.quantity}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Balance After
                </span>
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  {selectedTx.balance_after}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Operator
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {selectedTx.profiles?.raw_user_meta_data?.name ||
                    "System Admin"}
                </span>
              </div>

              <div className="space-y-1 py-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                  Remarks / Notes
                </span>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed italic">
                  {selectedTx.remarks || "No supplemental remarks logged."}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              Dismiss Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
