import { useState } from "react";
import type { Product } from "../../types/product";
import { ProductDetailsOverviewTab } from "./ProductDetailsOverviewTab";
import { ProductUnitsManager } from "../../product-units/components/ProductUnitsManager";
import { ProductDetailsStockSummary } from "./ProductDetailsStockSummary";
import { ProductDetailsActivity } from "./ProductDetailsActivity";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useProductStockHistory, useProductPurchaseHistory } from "../../hooks/useProducts";
import { formatDate } from "../../../../utils/formatDate";
import type { InventoryTransaction } from "../../../inventory/types/inventoryTransaction";
import type { PurchaseHistoryItem } from "./ProductDetailsActivity";

interface ProductDetailsHistoryTabsProps {
  product: Product;
  categoryName?: string;
  onEdit: () => void;
  onAdjustStock: () => void;
  onDuplicate: () => void;
  onPrintBarcode: () => void;
  onArchive: () => void;
}

export const ProductDetailsHistoryTabs = ({
  product,
  categoryName = "General",
  onEdit,
  onAdjustStock,
  onDuplicate,
  onPrintBarcode,
  onArchive,
}: ProductDetailsHistoryTabsProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "units" | "stock" | "sales" | "purchase" | "summary" | "activities" >("overview");

  const { data: rawStockHistory, isLoading: isStockLoading } = useProductStockHistory(product.id);
  const { data: rawPurchaseHistory, isLoading: isPurchaseLoading } = useProductPurchaseHistory(product.id);

  const stockHistory = (rawStockHistory || []) as InventoryTransaction[];
  const purchaseHistory = (rawPurchaseHistory || []) as PurchaseHistoryItem[];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "units", label: "Selling Units 🧮" },
    { id: "stock", label: "Stock History" },
    { id: "sales", label: "Sales History" },
    { id: "purchase", label: "Purchase History" },
    { id: "summary", label: "Stock Summary" },
    { id: "activities", label: "Product Activities" },
  ] as const;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden animate-fade-in">
      {/* Tab Headers */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 px-6 pt-3 gap-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-bold transition duration-150 border-b-2 relative -bottom-px whitespace-nowrap ${
              activeTab === tab.id
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <ProductDetailsOverviewTab
            product={product}
            categoryName={categoryName}
            onEdit={onEdit}
            onAdjustStock={onAdjustStock}
            onDuplicate={onDuplicate}
            onPrintBarcode={onPrintBarcode}
            onArchive={onArchive}
          />
        )}

        {activeTab === "units" && (
          <ProductUnitsManager product={product} />
        )}

        {activeTab === "stock" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
              Stock Movements
            </h3>
            {isStockLoading ? (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400 animate-pulse">
                Loading stock movements...
              </div>
            ) : stockHistory.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
                No stock movements logged for this product.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <th className="pb-2">Date & Time</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Reference</th>
                      <th className="pb-2 text-right">Quantity</th>
                      <th className="pb-2 text-right">New Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {stockHistory.map((tx) => {
                      const isPositive = tx.quantity >= 0;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 font-medium text-slate-500 dark:text-slate-400">
                            {formatDate(tx.created_at, true)}
                          </td>
                          <td className="py-2.5">
                            <span className={`inline-flex items-center gap-1 font-bold ${
                              isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                            }`}>
                              {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                              {tx.transaction_type}
                            </span>
                          </td>
                          <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{tx.reference || "N/A"}</td>
                          <td className={`py-2.5 text-right font-bold ${
                            isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          }`}>
                            {isPositive ? `+${tx.quantity}` : tx.quantity}
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-200">
                            {tx.balance_after}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "sales" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
              Recent Sales
            </h3>
            {/* Sales is mock for now since sales table isn't active, but filtered to this product's price */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="pb-2">Invoice ID</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Qty Sold</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">INV-2394</td>
                    <td className="py-2.5 font-medium text-slate-500 dark:text-slate-400">Walk-in Customer</td>
                    <td className="py-2.5 font-medium text-slate-500 dark:text-slate-400">15 Jul 2026, 01:15 PM</td>
                    <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-200">2</td>
                    <td className="py-2.5 text-right font-semibold text-slate-600 dark:text-slate-300 font-mono">{formatCurrency(product.selling_price || 0)}</td>
                    <td className="py-2.5 text-right font-extrabold text-slate-900 dark:text-slate-100 font-mono">{formatCurrency((product.selling_price || 0) * 2)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">INV-2381</td>
                    <td className="py-2.5 font-medium text-slate-500 dark:text-slate-400">Olamide Yusuf</td>
                    <td className="py-2.5 font-medium text-slate-500 dark:text-slate-400">14 Jul 2026, 11:20 AM</td>
                    <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-200">5</td>
                    <td className="py-2.5 text-right font-semibold text-slate-600 dark:text-slate-300 font-mono">{formatCurrency(product.selling_price || 0)}</td>
                    <td className="py-2.5 text-right font-extrabold text-slate-900 dark:text-slate-100 font-mono">{formatCurrency((product.selling_price || 0) * 5)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "purchase" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
              Recent Purchase Orders
            </h3>
            {isPurchaseLoading ? (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400 animate-pulse">
                Loading purchase history...
              </div>
            ) : purchaseHistory.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
                No purchase orders found for this product.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <th className="pb-2">Order Ref</th>
                      <th className="pb-2">Supplier</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2 text-right">Qty Ordered</th>
                      <th className="pb-2 text-right">Cost Price</th>
                      <th className="pb-2 text-right">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {purchaseHistory.map((item) => {
                      const po = item.purchase;
                      const supplierName = po?.supplier?.name || "Unknown Supplier";
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">
                            {po?.purchase_number || "N/A"}
                          </td>
                          <td className="py-2.5 font-medium text-slate-500 dark:text-slate-400">
                            {supplierName}
                          </td>
                          <td className="py-2.5 font-medium text-slate-500 dark:text-slate-400">
                            {po?.purchase_date ? formatDate(po.purchase_date, false) : "N/A"}
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-200">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 text-right font-semibold text-slate-600 dark:text-slate-300 font-mono">
                            {formatCurrency(item.unit_cost)}
                          </td>
                          <td className="py-2.5 text-right font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                            {formatCurrency(item.total_cost || (item.quantity * item.unit_cost))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "summary" && (
          <ProductDetailsStockSummary product={product} />
        )}

        {activeTab === "activities" && (
          <ProductDetailsActivity
            product={product}
            stockHistory={stockHistory}
            purchaseHistory={purchaseHistory}
          />
        )}
      </div>
    </div>
  );
};
