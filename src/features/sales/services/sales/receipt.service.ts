import type {
  ReceiptData,
  ReceiptItem,
  Sale,
} from "../types/sale";

/* -------------------------------------------------------------------------- */
/* Store Information                                                          */
/* -------------------------------------------------------------------------- */

const STORE_INFO = {
  name: "Farama Store",
  address: "Lagos, Nigeria",
  phone: "+234 XXX XXX XXXX",
};

/* -------------------------------------------------------------------------- */
/* Receipt Builder                                                            */
/* -------------------------------------------------------------------------- */

export function generateReceipt(
  sale: Sale
): ReceiptData {
  const items: ReceiptItem[] = (sale.items ?? []).map((item) => ({
    name:
      item.product?.name ??
      "Unknown Product",

    unit_name:
      item.product_unit?.unit?.symbol ??
      item.product_unit?.unit?.name ??
      "Unit",

    quantity: item.quantity,

    unit_price: item.unit_price,

    total: item.total_price,
  }));

  const subtotal =
    sale.subtotal ??
    sale.total_amount ??
    0;

  const total =
    sale.payable_amount ??
    sale.total_amount ??
    subtotal;

  const amountPaid =
    sale.amount_paid ??
    total;

  return {
    storeName: STORE_INFO.name,

    storeAddress: STORE_INFO.address,

    storePhone: STORE_INFO.phone,

    receiptNumber: sale.sale_number,

    date: sale.created_at,

    cashierName:
      sale.created_by ??
      "Cashier",

    customerName:
      sale.customer_name ??
      "Walk-in Customer",

    customerPhone:
      sale.customer_phone ?? "",

    items,

    subtotal,

    discount:
      sale.discount_amount ?? 0,

    tax:
      sale.tax_amount ?? 0,

    total,

    paymentMethod:
      sale.payment_method,

    amountPaid,

    change:
      Math.max(
        amountPaid - total,
        0
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* Receipt Preview                                                            */
/* -------------------------------------------------------------------------- */

export function previewReceipt(
  sale: Sale
): ReceiptData {
  return generateReceipt(sale);
}

/* -------------------------------------------------------------------------- */
/* Thermal Printer Payload                                                    */
/* -------------------------------------------------------------------------- */

export function buildThermalReceipt(
  sale: Sale
): ReceiptData {
  return generateReceipt(sale);
}

/* -------------------------------------------------------------------------- */
/* PDF Receipt Payload                                                        */
/* -------------------------------------------------------------------------- */

export function buildPDFReceipt(
  sale: Sale
): ReceiptData {
  return generateReceipt(sale);
}

/* -------------------------------------------------------------------------- */
/* Invoice Payload                                                            */
/* -------------------------------------------------------------------------- */

export function buildInvoice(
  sale: Sale
): ReceiptData {
  return generateReceipt(sale);
}

/* -------------------------------------------------------------------------- */
/* WhatsApp Receipt Payload                                                   */
/* -------------------------------------------------------------------------- */

export function buildWhatsAppReceipt(
  sale: Sale
): string {
  const receipt = generateReceipt(sale);

  let message = "";

  message += `${receipt.storeName}\n`;
  message += `${receipt.storeAddress}\n`;
  message += `${receipt.storePhone}\n\n`;

  message += `Receipt: ${receipt.receiptNumber}\n`;
  message += `Date: ${new Date(receipt.date).toLocaleString()}\n\n`;

  message += `Customer: ${receipt.customerName}\n`;

  if (receipt.customerPhone) {
    message += `Phone: ${receipt.customerPhone}\n`;
  }

  message += "\nItems\n";

  receipt.items.forEach((item) => {
    message += `• ${item.name}\n`;
    message += `  ${item.quantity} ${item.unit_name} × ₦${item.unit_price.toLocaleString()} = ₦${item.total.toLocaleString()}\n`;
  });

  message += "\n";

  message += `Subtotal: ₦${receipt.subtotal.toLocaleString()}\n`;
  message += `Discount: ₦${receipt.discount.toLocaleString()}\n`;
  message += `Tax: ₦${receipt.tax.toLocaleString()}\n`;
  message += `Total: ₦${receipt.total.toLocaleString()}\n`;
  message += `Paid: ₦${receipt.amountPaid?.toLocaleString()}\n`;
  message += `Change: ₦${receipt.change?.toLocaleString()}\n`;
  message += `Payment: ${receipt.paymentMethod}\n`;

  return message;
}

/* -------------------------------------------------------------------------- */
/* Email Receipt Payload                                                      */
/* -------------------------------------------------------------------------- */

export function buildEmailReceipt(
  sale: Sale
): ReceiptData {
  return generateReceipt(sale);
}