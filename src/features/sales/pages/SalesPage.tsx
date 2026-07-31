import { useState, useMemo } from "react";
import {
  ShoppingCart,
  History,
  Sun,
  Moon,
} from "lucide-react";
import { usePOSProducts, useSales, useRefundSale, useSalesStats } from "../hooks/useSales";
import { useCustomers } from "../../customers/hooks/useCustomers";
import { useCreateCustomer } from "../../customers/hooks/useCustomerMutations";
import CustomerModal from "../../customers/components/CustomerModal";
import ProductSearch from "../components/products/ProductSearch";
import ProductGrid from "../components/products/ProductGrid";
import CartSidebar from "../components/cart/CartSidebar";
import CheckoutModal from "../components/checkout/CheckoutModal";
import DiscountModal from "../components/checkout/DiscountModal";
import HoldCartModal from "../components/checkout/HoldCartModal";
import Receipt from "../components/receipt/Receipt";
import ThermalPrintingModal from "../components/thermal/ThermalPrintingModal";
import SalesHistory from "../components/sales-history/SalesHistory";
import SaleDetails from "../components/sales-history/SaleDetails";
import OutstandingDebtsWidget from "../components/sales-history/OutstandingDebtsWidget";
import type { POSProduct, Sale } from "../types/sale";
import { useCart } from "../hooks/useCart";
import { formatCurrency } from "../utils/pricing";
import { useTheme } from "../../../context/useThems";

export const SalesPage = () => {
  const { effectiveTheme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"pos" | "history">("pos");

  // Product Filter State
  const [posSearch, setPosSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedUnitIds, setSelectedUnitIds] = useState<Record<string, string>>({});

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isHoldOpen, setIsHoldOpen] = useState(false);
  const [selectedSaleReceipt, setSelectedSaleReceipt] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isThermalPrintingOpen, setIsThermalPrintingOpen] = useState(false);
  const [selectedSaleDetails, setSelectedSaleDetails] = useState<Sale | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Queries & Mutations
  const { data: posProducts = [], isLoading: isProductsLoading } = usePOSProducts();
  const { data: salesHistory = [], isLoading: isHistoryLoading } = useSales();
  const { data: salesStats } = useSalesStats();
  const { data: customerList = [] } = useCustomers();
  const refundMutation = useRefundSale();

  const { addItem, subtotal } = useCart();

  // Extract Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    posProducts.forEach((p: POSProduct) => {
      if (p.category?.name) set.add(p.category.name);
    });
    return Array.from(set);
  }, [posProducts]);

  // Filter Catalog Products
  const filteredProducts = useMemo(() => {
    return posProducts.filter((p: POSProduct) => {
      const matchQuery =
        p.name.toLowerCase().includes(posSearch.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(posSearch.toLowerCase()));
      const matchCat =
        selectedCategory === "all" || p.category?.name === selectedCategory;
      return matchQuery && matchCat;
    });
  }, [posProducts, posSearch, selectedCategory]);

  const handleUnitSelect = (productId: string, unitId: string) => {
    setSelectedUnitIds((prev) => ({ ...prev, [productId]: unitId }));
  };

  const handleRefund = async (saleId: string) => {
    if (confirm("Are you sure you want to process a full refund for this sale?")) {
      await refundMutation.mutateAsync(saleId);
      if (isDetailsOpen) setIsDetailsOpen(false);
    }
  };

  const createCustomerMutation = useCreateCustomer();

  return (
    <div className="space-y-6 p-4 sm:p-6 w-full">
      {/* Top Header & Overview Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sales & Point of Sale (POS)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Process checkout transactions, manage held carts, and view history.
          </p>
        </div>

        {/* Navigation Tabs & Theme Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-2 text-xs font-bold shadow-2xs cursor-pointer"
            title="Toggle Dark Mode"
          >
            {effectiveTheme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("pos")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "pos"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Terminal (POS)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "history"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <History className="w-4 h-4" />
              Transactions History
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats Bar */}
      {salesStats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block">Total Sales</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {salesStats.totalSales}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block">Total Revenue</span>
            <span className="text-lg font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(salesStats.totalRevenue)}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block">Net Profit</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(salesStats.netProfit)}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block">Avg Order Value</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(salesStats.averageOrderValue || 0)}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 block">Outstanding Debt</span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(salesStats.totalOutstandingBalance || 0)}
            </span>
          </div>
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === "pos" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Catalog Search & Products Grid */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <ProductSearch
              searchQuery={posSearch}
              onSearchChange={setPosSearch}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <ProductGrid
              products={filteredProducts}
              isLoading={isProductsLoading}
              selectedUnitIds={selectedUnitIds}
              onSelectUnit={handleUnitSelect}
              onAddToCart={(prod, uId) => addItem(prod, uId)}
            />
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
            <CartSidebar
              customers={customerList}
              onOpenCheckout={() => setIsCheckoutOpen(true)}
              onOpenHoldModal={() => setIsHoldOpen(true)}
              onOpenDiscountModal={() => setIsDiscountOpen(true)}
              onOpenAddCustomerModal={() => setIsCustomerModalOpen(true)}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <OutstandingDebtsWidget
            sales={salesHistory}
            isLoading={isHistoryLoading}
            onSelectSale={(s) => {
              setSelectedSaleDetails(s);
              setIsDetailsOpen(true);
            }}
          />

          <SalesHistory
            sales={salesHistory}
            isLoading={isHistoryLoading}
            onSelectSale={(s) => {
              setSelectedSaleDetails(s);
              setIsDetailsOpen(true);
            }}
            onOpenReceipt={(s) => {
              setSelectedSaleReceipt(s);
              setIsReceiptOpen(true);
            }}
            onRefundSale={handleRefund}
          />
        </div>
      )}

      {/* Modals Container */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        customers={customerList}
        onOpenAddCustomerModal={() => setIsCustomerModalOpen(true)}
        onSaleCompleted={(sale) => {
          setSelectedSaleReceipt(sale);
          setIsThermalPrintingOpen(true);
        }}
      />

      <DiscountModal
        isOpen={isDiscountOpen}
        onClose={() => setIsDiscountOpen(false)}
        subtotal={subtotal}
      />

      <HoldCartModal
        isOpen={isHoldOpen}
        onClose={() => setIsHoldOpen(false)}
      />

      {selectedSaleReceipt && (
        <ThermalPrintingModal
          sale={selectedSaleReceipt}
          isOpen={isThermalPrintingOpen}
          onClose={() => {
            setIsThermalPrintingOpen(false);
            setSelectedSaleReceipt(null);
          }}
        />
      )}

      {selectedSaleReceipt && (
        <Receipt
          sale={selectedSaleReceipt}
          isOpen={isReceiptOpen}
          onClose={() => {
            setIsReceiptOpen(false);
            setSelectedSaleReceipt(null);
          }}
        />
      )}

      {selectedSaleDetails && (
        <SaleDetails
          sale={selectedSaleDetails}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedSaleDetails(null);
          }}
          onOpenReceipt={(s) => {
            setIsDetailsOpen(false);
            setSelectedSaleDetails(null);
            setSelectedSaleReceipt(s);
            setIsThermalPrintingOpen(true);
          }}
          onRefundSale={handleRefund}
          isRefunding={refundMutation.isPending}
        />
      )}

      {isCustomerModalOpen && (
        <CustomerModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          onSave={async (data) => {
            await createCustomerMutation.mutateAsync(data);
            setIsCustomerModalOpen(false);
          }}
          isLoading={createCustomerMutation.isPending}
        />
      )}
    </div>
  );
};

export default SalesPage;
