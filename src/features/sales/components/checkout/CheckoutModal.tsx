import { useState } from "react";
import { X, CreditCard, CheckCircle2, User, Coins, AlertCircle } from "lucide-react";
import type { Customer } from "../../../customers/types/customer";
import { useCartStore } from "../../store/cart.store";
import { useCheckout } from "../../hooks/useCheckout";
import { usePayments } from "../../hooks/usePayments";
import PaymentModal from "./PaymentModal";
import { formatCurrency } from "../../utils/pricing";
import type { Sale } from "../../types/sale";
import { WALK_IN_CUSTOMER_ID } from "../../constants";
import { toast } from "sonner";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onSaleCompleted?: (sale: Sale) => void;
}

export const CheckoutModal = ({
  isOpen,
  onClose,
  customers,
  onSaleCompleted,
}: CheckoutModalProps) => {
  const cartStore = useCartStore();
  const { checkout, isCheckingOut, validateAndProceed } = useCheckout();
  const {
    paymentMethod,
    setPaymentMethod,
    cashTendered,
    setCashTendered,
    calculateChange,
  } = usePayments();

  const [customerNameOverride, setCustomerNameOverride] = useState("");
  const [customerPhoneOverride, setCustomerPhoneOverride] = useState("");
  const [customAmountPaid, setCustomAmountPaid] = useState<string>("");

  if (!isOpen) return null;

  const activeCustomer = customers.find((c) => c.id === cartStore.selectedCustomerId);

  // Calculations
  const subtotal = cartStore.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const discountAmount =
    cartStore.discountType === "percentage"
      ? (subtotal * cartStore.discountVal) / 100
      : cartStore.discountVal;
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (subtotalAfterDiscount * cartStore.taxRate) / 100;
  const payableAmount = Math.max(0, subtotal - discountAmount + taxAmount);

  const amountPaid = customAmountPaid !== "" ? Math.max(0, Number(customAmountPaid)) : payableAmount;
  const outstandingBalance = Math.max(0, payableAmount - amountPaid);

  const changeDue = calculateChange(amountPaid);

  const handleConfirmCheckout = async () => {
    if (!validateAndProceed(activeCustomer, payableAmount)) {
      return;
    }

    const saleName =
      customerNameOverride.trim() ||
      activeCustomer?.name ||
      "Walk-in Customer";
    const salePhone =
      customerPhoneOverride.trim() ||
      activeCustomer?.phone ||
      "";

    const selectedCustomerIdToSend =
      !cartStore.selectedCustomerId || cartStore.selectedCustomerId === WALK_IN_CUSTOMER_ID
        ? null
        : cartStore.selectedCustomerId;

    if (outstandingBalance > 0 && !selectedCustomerIdToSend) {
      toast.error("Partial payments with outstanding balance can only be recorded for registered customers. Please assign a customer.");
      return;
    }

    const saleInput = {
      cart_id: cartStore.activeCartId,
      customer_id: selectedCustomerIdToSend,
      customer_name: saleName,
      customer_phone: salePhone,
      total_amount: subtotal,
      subtotal: subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      payable_amount: payableAmount,
      amount_paid: amountPaid,
      payment_method: paymentMethod,
      remarks: cartStore.remarks,
      items: cartStore.items.map((item) => ({
        product_id: item.product_id,
        product_unit_id: item.product_unit_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        cost_price: item.cost_price,
        discount: item.discount || 0,
        tax: item.tax || 0,
        total_price: item.quantity * item.unit_price,
      })),
    };

    const completedSale = await checkout(saleInput);
    if (completedSale) {
      if (onSaleCompleted) onSaleCompleted(completedSale);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-5 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <CreditCard className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              Complete Point of Sale Checkout
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar">
          {/* Order Summary Box */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Items Count:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {cartStore.items.reduce((s, i) => s + i.quantity, 0)} units
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(subtotal)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-semibold">
                <span>Discount:</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>VAT / Tax ({cartStore.taxRate}%):</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                +{formatCurrency(taxAmount)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-base font-extrabold">
              <span className="text-slate-900 dark:text-white">Total Payable</span>
              <span className="text-xl text-blue-600 dark:text-blue-400 font-black">
                {formatCurrency(payableAmount)}
              </span>
            </div>
          </div>

          {/* Customer Details Overrides if needed */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-500" />
              Customer Reference
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={customerNameOverride}
                onChange={(e) => setCustomerNameOverride(e.target.value)}
                placeholder={activeCustomer?.name || "Walk-in Customer Name"}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none"
              />
              <input
                type="text"
                value={customerPhoneOverride}
                onChange={(e) => setCustomerPhoneOverride(e.target.value)}
                placeholder={activeCustomer?.phone || "Phone Number"}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>
          </div>

          {/* Amount Paid & Outstanding Debt Tracking */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-500" />
                Amount Paid by Customer
              </label>
              <button
                type="button"
                onClick={() => setCustomAmountPaid(payableAmount.toString())}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Full Payment ({formatCurrency(payableAmount)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₦</span>
              <input
                type="number"
                min="0"
                max={payableAmount}
                step="any"
                value={customAmountPaid === "" ? payableAmount : customAmountPaid}
                onChange={(e) => setCustomAmountPaid(e.target.value)}
                placeholder={payableAmount.toString()}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm font-extrabold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            {outstandingBalance > 0 && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-300">
                  <span>Outstanding Customer Debt:</span>
                  <span>{formatCurrency(outstandingBalance)}</span>
                </div>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {activeCustomer ? (
                    <span><strong>{activeCustomer.name}</strong> will hold an outstanding balance of <strong>{formatCurrency(outstandingBalance)}</strong>.</span>
                  ) : (
                    <span>Partial payment requires selecting a registered customer to record debt.</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Payment Method Selector Component */}
          <PaymentModal
            paymentMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
            payableAmount={payableAmount}
            cashTendered={cashTendered}
            onChangeCashTendered={setCashTendered}
            changeDue={changeDue}
            customerWalletBalance={activeCustomer?.wallet_balance}
          />

          {/* Remarks Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Transaction Remarks / Internal Notes
            </label>
            <textarea
              rows={2}
              value={cartStore.remarks}
              onChange={(e) => cartStore.setRemarks(e.target.value)}
              placeholder="Optional notes or reference..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isCheckingOut}
            onClick={handleConfirmCheckout}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isCheckingOut ? "Processing Sale..." : "Confirm & Pay"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
