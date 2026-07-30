import { CreditCard, Bookmark } from "lucide-react";
import type { Customer } from "../../../customers/types/customer";
import CustomerSelector from "../customer/CustomerSelector";
import CartHeader from "./CartHeader";
import CartList from "./CartList";
import CartTotals from "./CartTotals";
import { useCart } from "../../hooks/useCart";

interface CartSidebarProps {
  customers: Customer[];
  onOpenCheckout: () => void;
  onOpenHoldModal: () => void;
  onOpenDiscountModal: () => void;
  onOpenAddCustomerModal?: () => void;
}

export const CartSidebar = ({
  customers,
  onOpenCheckout,
  onOpenHoldModal,
  onOpenDiscountModal,
  onOpenAddCustomerModal,
}: CartSidebarProps) => {
  const {
    items,
    selectedCustomerId,
    setSelectedCustomerId,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discountAmount,
    taxAmount,
    payableAmount,
    taxRate,
    totalItemCount,
    heldCarts,
  } = useCart();

  const isCartEmpty = items.length === 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 shadow-sm flex flex-col h-full justify-between space-y-4">
      {/* Customer Selector & Cart Header */}
      <div className="space-y-3">
        <CustomerSelector
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={setSelectedCustomerId}
          onOpenAddCustomerModal={onOpenAddCustomerModal}
        />

        <CartHeader
          itemCount={totalItemCount}
          onClearCart={clearCart}
          onOpenHeldCarts={onOpenHoldModal}
          heldCount={heldCarts.length}
        />
      </div>

      {/* Cart Line Items */}
      <div className="flex-1 min-h-[220px]">
        <CartList
          items={items}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
        />
      </div>

      {/* Cart Totals & Checkout Actions */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <CartTotals
          subtotal={subtotal}
          discountAmount={discountAmount}
          taxAmount={taxAmount}
          payableAmount={payableAmount}
          taxRate={taxRate}
          onOpenDiscountModal={onOpenDiscountModal}
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isCartEmpty}
            onClick={onOpenHoldModal}
            className="w-full py-2.5 px-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Bookmark className="w-4 h-4" />
            Hold Order
          </button>

          <button
            type="button"
            disabled={isCartEmpty}
            onClick={onOpenCheckout}
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-4 h-4" />
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
