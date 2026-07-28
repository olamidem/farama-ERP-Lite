/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { RowSelectionState } from "@tanstack/react-table";
import ErrorState from "../components/common/ErrorState";
import Pagination from "../components/ui/pagination/Pagination";
import ProductToolbar from "../features/products/components/ProductToolbar";
import ProductTable from "../features/products/components/ProductTable";
import ProductBulkActions from "../features/products/components/ProductBulkActions";
import AddProductModal from "../features/products/components/AddProductModal";
import EditProductModal from "../features/products/components/EditProductModal";
import DeleteProductModal from "../features/products/components/DeleteProductModal";
import RestoreProductModal from "../features/products/components/RestoreProductModal";
import BulkUpdateModal from "../features/products/components/BulkUpdateModal";
import ProductImportModal from "../features/products/components/ProductImportModal";
import ExportProductDropdown from "../features/products/components/ExportProductDropdown";
import {
  useProducts,
  useBulkDeactivateProducts,
  useProductStats,
} from "../features/products/hooks/useProducts";
import { useCategories } from "../features/categories/hooks/useCategories";
import type { Product } from "../features/products/types/product";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  Plus,
  ChevronDown,
  Upload,
  Download,
  FileText,
} from "lucide-react";
import { useProductExport } from "../features/products/hooks/useProductExport";
import ProductStatCards from "../features/products/components/ProductStartCards";

const ProductsPage = () => {
  // ==========================
  // Modals
  // ==========================

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // ==========================
  // Filters
  // ==========================

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("all");
  const [stockStatus, setStockStatus] = useState<
    "all" | "in_stock" | "low_stock" | "out_of_stock"
  >("all");

  // ==========================
  // Pagination
  // ==========================

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(() => {
    const saved = localStorage.getItem("products-page-size");
    return saved ? Number(saved) : 10;
  });

  // ==========================
  // Sorting
  // ==========================

  const [sortBy, setSortBy] = useState<
    "created_at" | "name" | "selling_price" | "stock"
  >("created_at");

  const [ascending, setAscending] = useState(false);

  // ==========================
  // Table Selection
  // ==========================

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // ==========================
  // Selected Product
  // ==========================

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDeactivate, setProductToDeactivate] =
    useState<Product | null>(null);
  const [productToRestore, setProductToRestore] = useState<Product | null>(
    null,
  );

  // ==========================
  // Categories
  // ==========================

  const { data: categories = [] } = useCategories();

  // ==========================
  // Products
  // ==========================

  const { data, isLoading, error } = useProducts({
    page,
    pageSize,
    search,
    category,
    status: status as "all" | "active" | "inactive",
    stockStatus,
    sortBy,
    ascending,
  });

  const { data: stats, isLoading: isStatsLoading } = useProductStats();
  const { exportProducts, downloadTemplate } = useProductExport();

  const bulkDeactivate = useBulkDeactivateProducts();

  const products = useMemo(() => data?.data ?? [], [data?.data]);
  const totalProducts = data?.count ?? 0;

  // ==========================
  // Selected Products
  // ==========================

  const selectedProducts = useMemo(() => {
    return products.filter((product) => rowSelection[product.id]);
  }, [products, rowSelection]);

  // ==========================
  // Persist page size
  // ==========================

  useEffect(() => {
    localStorage.setItem("products-page-size", String(pageSize));
  }, [pageSize]);

  // ==========================
  // Reset page when filters change
  // ==========================

  useEffect(() => {
    setPage(1);
  }, [search, category, status, stockStatus]);

  // ==========================
  // Clear selection when page changes
  // ==========================

  useEffect(() => {
    setRowSelection({});
  }, [page, pageSize]);

  // ==========================
  // Handlers
  // ==========================

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedProduct(null);
    setIsEditModalOpen(false);
  };

  const handleDeactivateProduct = (product: Product) => {
    setProductToDeactivate(product);
  };

  const handleRestoreProduct = (product: Product) => {
    setProductToRestore(product);
  };

  const handleBulkDeactivate = async () => {
    try {
      const ids = selectedProducts.map((p) => p.id);
      await bulkDeactivate.mutateAsync(ids);
      setRowSelection({});
      setIsBulkDeleteOpen(false);
    } catch {
      // toast is already handled in the hook
    }
  };

  const handleSort = (
    column: "created_at" | "name" | "selling_price" | "stock",
  ) => {
    if (sortBy === column) {
      setAscending((prev) => !prev);
    } else {
      setSortBy(column);
      setAscending(true);
    }
    setPage(1);
  };

  const handleExportAll = () => {
    exportProducts(products, categories, "xlsx");
  };

  const handleDownloadTemplateXlsx = () => {
    downloadTemplate("xlsx");
  };

  // ==========================
  // Error
  // ==========================

  if (error) {
    return (
      <ErrorState
        title="Unable to load products"
        description="We couldn't retrieve your products. Please try again."
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* High-Fidelity Header Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Products
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage and view all products in your store.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Add Product Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition duration-150 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Product</span>
            <ChevronDown size={14} className="opacity-80" />
          </button>
        </div>
      </div>

      {/* Top Action Color Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/15 dark:bg-blue-950/40 hover:bg-blue-50/60 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <Upload size={14} />
          <span>Import Products</span>
        </button>

        <button
          onClick={handleExportAll}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/15 dark:bg-emerald-950/40 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <Download size={14} />
          <span>Export Products</span>
        </button>

        <button
          onClick={handleDownloadTemplateXlsx}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/15 dark:bg-purple-950/40 hover:bg-purple-50/60 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <FileText size={14} />
          <span>Download Template</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <ProductStatCards stats={stats} isLoading={isStatsLoading} />

      {/* Filters & Actions Toolbar */}
      <ProductToolbar
        search={search}
        onSearchChange={setSearch}
        category={category}
        status={status}
        stockStatus={stockStatus}
        categories={categories}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
        onStockStatusChange={(val) =>
          setStockStatus(
            val as "all" | "in_stock" | "low_stock" | "out_of_stock",
          )
        }
        exportMenu={
          <ExportProductDropdown
            products={products}
            filteredProducts={products}
            categories={categories}
          />
        }
      />

      <AnimatePresence mode="wait">
        {selectedProducts.length > 0 && (
          <ProductBulkActions
            selectedCount={selectedProducts.length}
            onClearSelection={() => setRowSelection({})}
            onBulkUpdate={() => setBulkModalOpen(true)}
            onBulkDelete={() => setIsBulkDeleteOpen(true)}
          />
        )}
      </AnimatePresence>

      <ProductTable
        products={products}
        categories={categories}
        isLoading={isLoading}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onEdit={handleEditProduct}
        onDeactivate={handleDeactivateProduct}
        onRestore={handleRestoreProduct}
        sortBy={sortBy}
        ascending={ascending}
        onSort={handleSort}
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={totalProducts}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      <AddProductModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onViewExisting={(product) => {
          setIsAddModalOpen(false);
          setSelectedProduct(product);
          setIsEditModalOpen(true);
        }}
      />

      <ProductImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        categories={categories}
      />

      <BulkUpdateModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        onSuccess={() => setRowSelection({})}
        selectedProducts={selectedProducts}
      />

      <EditProductModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        product={selectedProduct}
      />

      <DeleteProductModal
        open={!!productToDeactivate}
        product={productToDeactivate}
        onClose={() => setProductToDeactivate(null)}
      />

      <RestoreProductModal
        open={!!productToRestore}
        product={productToRestore}
        onClose={() => setProductToRestore(null)}
      />

      <ConfirmDialog
        open={isBulkDeleteOpen}
        title="Batch Deactivation"
        subtitle="Moving multiple products to inactive state."
        description={`Are you sure you want to deactivate ${selectedProducts.length} selected products? They will be removed from your active catalog but can be restored later.`}
        confirmationKeyword="DEACTIVATE ALL"
        confirmText="Deactivate Products"
        cancelText="Cancel"
        loading={bulkDeactivate.isPending}
        onCancel={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleBulkDeactivate}
      />
    </motion.div>
  );
};

export default ProductsPage;
