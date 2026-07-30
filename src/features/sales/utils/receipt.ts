import type { Sale } from "../types/sale";
import type { ReceiptData } from "../types/receipt";

export function formatReceiptData(
  sale: Sale,
  amountPaid?: number,
  change?: number,
  storeInfo?: { name?: string; address?: string; phone?: string }
): ReceiptData {
  const items = (sale.items || []).map((item) => {
    const productName = item.product?.name || "Item";
    const unitName = item.product_unit?.unit?.symbol || item.product_unit?.unit?.name || "unit";
    return {
      name: productName,
      unit_name: unitName,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total_price || item.quantity * item.unit_price,
    };
  });

  return {
    storeName: storeInfo?.name || "FARAMA STORE",
    storeAddress: storeInfo?.address || "Main Retail Outlet",
    storePhone: storeInfo?.phone || "+234 800 000 0000",
    receiptNumber: sale.sale_number,
    date: sale.created_at ? new Date(sale.created_at).toLocaleString() : new Date().toLocaleString(),
    cashierName: sale.created_by || "Cashier",
    customerName: sale.customer_name || "Walk-in Customer",
    customerPhone: sale.customer_phone || "",
    items,
    subtotal: sale.subtotal || sale.payable_amount,
    discount: sale.discount_amount || 0,
    tax: sale.tax_amount || 0,
    total: sale.payable_amount,
    paymentMethod: sale.payment_method,
    amountPaid: amountPaid ?? sale.payable_amount,
    change: change ?? 0,
  };
}

export function printReceiptElement(elementId: string): void {
  const printContent = document.getElementById(elementId);
  if (!printContent) {
    window.print();
    return;
  }
  const windowUrl = "about:blank";
  const uniqueName = new Date().getTime();
  const windowName = "Print" + uniqueName;
  const printWindow = window.open(
    windowUrl,
    windowName,
    "left=100,top=100,width=800,height=600"
  );

  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt Print</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; color: #000; }
            .no-print { display: none !important; }
            table { width: 100%; border-collapse: collapse; }
            td, th { padding: 4px 0; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .border-t { border-top: 1px dashed #000; }
            .border-b { border-bottom: 1px dashed #000; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  } else {
    window.print();
  }
}
