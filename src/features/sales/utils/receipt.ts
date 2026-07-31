import type { Sale } from "../types/sale";
import type { ReceiptData } from "../types/receipt";
import { useReceiptStore } from "../store/receipt.store";
import { thermalPrinter } from "../services/thermal/escpos-printer";

export function formatReceiptData(
  sale: Sale,
  amountPaid?: number,
  change?: number
): ReceiptData & { rcNumber?: string; logoUrl?: string; socialHandle?: string; footerText?: string } {
  const settings = useReceiptStore.getState().settings;

  const items = (sale.items || []).map((item) => {
    const productName = item.product?.name || "Item";
    const unitName = item.product_unit?.unit?.symbol || item.product_unit?.unit_name || "unit";
    return {
      name: productName,
      unit_name: unitName,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total_price || item.quantity * item.unit_price,
    };
  });

  const actualPaid = amountPaid ?? Number(sale.amount_paid ?? sale.payable_amount);
  const actualBalance = sale.balance_due ?? Math.max(0, sale.payable_amount - actualPaid);

  return {
    storeName: settings.storeName || "FARAMA STORE",
    storeAddress: settings.storeAddress || "12, Garki Road, Area 11, Abuja",
    storePhone: settings.storePhone || "+234 803 123 4567",
    rcNumber: settings.rcNumber || "RC: 938472-A",
    socialHandle: settings.socialHandle || "@faramastore",
    logoUrl: settings.logoUrl || "",
    footerText: settings.footerText || "Thank you for shopping with us! Please keep this receipt for return/refund reference.",
    receiptNumber: sale.sale_number,
    date: sale.created_at ? new Date(sale.created_at).toLocaleString() : new Date().toLocaleString(),
    cashierName: sale.created_by || "Super Admin",
    customerName: sale.customer_name || "Walk-In Customer",
    customerPhone: sale.customer_phone || "",
    items,
    subtotal: sale.subtotal || sale.payable_amount,
    discount: sale.discount_amount || 0,
    tax: sale.tax_amount || 0,
    total: sale.payable_amount,
    paymentMethod: sale.payment_method,
    amountPaid: actualPaid,
    balanceDue: actualBalance,
    change: change ?? 0,
  };
}

/**
 * Direct ESC/POS thermal printing for a sale object
 */
export async function printThermalReceiptForSale(sale: Sale, paperWidth: 58 | 80 = 58): Promise<boolean> {
  const data = formatReceiptData(sale);
  try {
    if (!thermalPrinter.isConnected()) {
      await thermalPrinter.connect();
    }
    await thermalPrinter.printReceipt({
      storeName: data.storeName,
      storeAddress: data.storeAddress,
      storePhone: data.storePhone,
      rcNumber: data.rcNumber,
      receiptNumber: data.receiptNumber,
      date: data.date,
      cashierName: data.cashierName,
      customerName: data.customerName || "Walk-In Customer",
      paymentMethod: data.paymentMethod,
      items: data.items,
      subtotal: data.subtotal,
      discount: data.discount,
      tax: data.tax,
      total: data.total,
      amountPaid: data.amountPaid,
      balanceDue: data.balanceDue,
      change: data.change,
      currencySymbol: "₦",
    }, paperWidth);
    useReceiptStore.getState().markSaleAsPrinted(sale.id);
    return true;
  } catch (err) {
    console.error("Direct ESC/POS thermal printing error:", err);
    return false;
  }
}

export function printThermalReceipt(_elementId: string, saleId?: string): void {
  if (saleId) {
    useReceiptStore.getState().markSaleAsPrinted(saleId);
  }
}

export function printReceiptElement(elementId: string, saleId?: string): void {
  printThermalReceipt(elementId, saleId);
}
