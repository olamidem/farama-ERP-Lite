import { useSupplierProducts } from "../../hooks/useSupplierProducts";
import { formatDate } from "../../../../utils/formatDate";
import { formatCurrency } from "../../../../utils/formatCurrenty";

interface ProductsSuppliedTabProps {
  supplierId: string;
}

export default function ProductsSuppliedTab({
  supplierId,
}: ProductsSuppliedTabProps) {
  const { data: products = [], isLoading } = useSupplierProducts(supplierId);

  if (isLoading) {
    return (
      <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
        Loading products list...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
        No products supplied yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Products Supplied</h4>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {products.length} {products.length === 1 ? "Product" : "Products"}{" "}
          Total
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left border-collapse bg-white dark:bg-slate-900">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50">
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4 text-right">Cost Price</th>
              <th className="py-3 px-4 text-right">Base Stock</th>
              <th className="py-3 px-4 text-right">Qty Received</th>
              <th className="py-3 px-4">Last Received Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-[13px]">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition">
                <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">
                  {product.name}
                </td>
                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                  {product.sku || "N/A"}
                </td>
                <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-300 font-medium">
                  {formatCurrency(product.cost_price || 0)}
                </td>
                <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-300 font-semibold">
                  {product.stock || 0}
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                  {product.totalQuantityReceived}
                </td>
                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                  {product.lastReceivedDate
                    ? formatDate(product.lastReceivedDate)
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
