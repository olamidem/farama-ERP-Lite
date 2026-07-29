import { useState, useMemo } from "react";
import { Search, Download } from "lucide-react";
import type { InventoryTransactionWithRelations } from "../../types/inventoryTransaction";
import { getInventoryTransactionColumns } from "../inventoryTransactionColumns";
import DataTable from "../../../../components/ui/DataTable/DataTable";
import Pagination from "../../../../components/ui/pagination/Pagination";

interface InventoryTransactionsTableProps {
  transactions: InventoryTransactionWithRelations[];
  isLoading: boolean;
  productsList: { id: string; name: string }[];
  onViewDetails: (tx: InventoryTransactionWithRelations) => void;
}

export const InventoryTransactionsTable = ({
  transactions,
  isLoading,
  productsList,
  onViewDetails,
}: InventoryTransactionsTableProps) => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(16);

  // Extract unique users for filter
  const usersList = useMemo(() => {
    const list = new Set<string>();
    transactions.forEach((t) => {
      const u = t.profiles?.raw_user_meta_data?.name || "Admin User";
      list.add(u);
    });
    return Array.from(list);
  }, [transactions]);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search.trim() ||
        (tx.product?.name || "").toLowerCase().includes(searchLower) ||
        (tx.product?.sku || "").toLowerCase().includes(searchLower) ||
        tx.reference.toLowerCase().includes(searchLower) ||
        (tx.remarks || "").toLowerCase().includes(searchLower);

      // Type
      const matchesType = selectedType === "All" || tx.transaction_type === selectedType;

      // Product
      const matchesProduct = selectedProduct === "All" || tx.product_id === selectedProduct;

      // User
      const userDisplay = tx.profiles?.raw_user_meta_data?.name || "Admin User";
      const matchesUser = selectedUser === "All" || userDisplay === selectedUser;

      // Date Range
      let matchesDate = true;
      if (selectedDateRange !== "All") {
        const date = new Date(tx.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (selectedDateRange === "Today") {
          matchesDate = diffDays <= 1;
        } else if (selectedDateRange === "This Week") {
          matchesDate = diffDays <= 7;
        } else if (selectedDateRange === "This Month") {
          matchesDate = diffDays <= 30;
        }
      }

      return matchesSearch && matchesType && matchesProduct && matchesUser && matchesDate;
    });
  }, [transactions, search, selectedType, selectedProduct, selectedUser, selectedDateRange]);

  // Pagination logic
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const columns = useMemo(() => getInventoryTransactionColumns({ onViewDetails }), [onViewDetails]);

  // Export to CSV helper
  const handleExport = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ["Date", "Product", "SKU", "Unit", "Type", "Quantity", "Balance After", "Reference", "User", "Remarks"];
    const rows = filteredTransactions.map((tx) => [
      new Date(tx.created_at).toLocaleString(),
      tx.product?.name ?? "N/A",
      tx.product?.sku ?? "N/A",
      `${tx.product_unit?.unit?.name || "pcs"} (${tx.product_unit?.unit?.symbol || ""})`,
      tx.transaction_type,
      tx.quantity,
      tx.balance_after,
      tx.reference,
      tx.profiles?.raw_user_meta_data?.name || "Admin User",
      tx.remarks || "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_transactions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Recent Inventory Transactions</span>
          </h3>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
            Audit logs and transactional history of physical stock changes.
          </p>
        </div>
      </div>

      {/* Filter Section from Picture 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end pb-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search product, reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 h-10 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Type Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 h-10 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[right_0.5rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat pr-8"
          >
            <option value="All">All</option>
            <option value="PURCHASE">PURCHASE</option>
            <option value="SALE">SALE</option>
            <option value="RETURN">RETURN</option>
            <option value="ADJUSTMENT">ADJUSTMENT</option>
            <option value="DAMAGE">DAMAGE</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="OPENING STOCK">OPENING STOCK</option>
          </select>
        </div>

        {/* Product Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Product</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 h-10 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[right_0.5rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat pr-8"
          >
            <option value="All">All</option>
            {productsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Date Range</label>
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="w-full text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 h-10 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[right_0.5rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat pr-8"
          >
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
        </div>

        {/* User Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">User</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 h-10 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[right_0.5rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat pr-8"
          >
            <option value="All">All</option>
            {usersList.map((usr) => (
              <option key={usr} value={usr}>
                {usr}
              </option>
            ))}
          </select>
        </div>

        {/* Export Button */}
        <div>
          <button
            onClick={handleExport}
            disabled={filteredTransactions.length === 0}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} className="text-slate-500 dark:text-slate-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        data={paginatedTransactions}
        columns={columns}
        isLoading={isLoading}
        emptyTitle="No Transactions Found"
        emptyDescription="Try adjusting your filter parameters or perform a new stock adjustment."
      />

      {/* Pagination Controls matching the project custom components */}
      {!isLoading && totalItems > 0 && (
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          }}
          itemName="transactions"
        />
      )}
    </div>
  );
};

export default InventoryTransactionsTable;
