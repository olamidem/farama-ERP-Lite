/**
 * Thermal Receipt Formatter — FARAMA STORE Style
 * Replicates the exact layout from the provided receipt image
 * Optimized for 58mm (2-inch) thermal paper (≈32 chars) or 80mm (≈48 chars)
 */

import type { ReceiptPrintData } from "./escpos-printer";

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;
const encoder = new TextEncoder();

function encode(str: string): number[] {
  return Array.from(encoder.encode(str));
}

function padRight(str: string, length: number): string {
  return str.length >= length ? str.slice(0, length) : str + " ".repeat(length - str.length);
}

function padLeft(str: string, length: number): string {
  return str.length >= length ? str.slice(-length) : " ".repeat(length - str.length) + str;
}

export function center(str: string, width: number): string {
  if (str.length >= width) return str.slice(0, width);
  const pad = width - str.length;
  const left = Math.floor(pad / 2);
  return " ".repeat(left) + str + " ".repeat(pad - left);
}

export function formatMoney(amount: number, symbol: string = "₦"): string {
  return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function dashedLine(width: number): string {
  return "-".repeat(width);
}

/**
 * Format receipt matching the FARAMA STORE receipt image exactly.
 * Paper width: 58mm = ~32 chars, 80mm = ~48 chars
 */
export function formatReceiptForThermal(
  data: ReceiptPrintData,
  paperWidth: 58 | 80 = 58
): Uint8Array {
  const W = paperWidth === 58 ? 32 : 48;
  const cmds: number[] = [];
  const sym = data.currencySymbol || "₦";

  // ── Initialize printer ──
  cmds.push(ESC, 0x40); // ESC @

  // ═══════════════════════════════════════
  // HEADER — Store Info (centered)
  // ═══════════════════════════════════════
  cmds.push(ESC, 0x61, 0x01); // Center align
  cmds.push(ESC, 0x21, 0x20); // Double height + width (largest)
  cmds.push(ESC, 0x45, 0x01); // Bold on
  cmds.push(...encode((data.storeName || "FARAMA STORE").toUpperCase()));
  cmds.push(ESC, 0x45, 0x00); // Bold off
  cmds.push(ESC, 0x21, 0x00); // Normal size
  cmds.push(LF);

  if (data.storeAddress) {
    cmds.push(...encode(data.storeAddress));
    cmds.push(LF);
  }
  if (data.storePhone) {
    cmds.push(...encode(`Tel: ${data.storePhone}`));
    cmds.push(LF);
  }
  if (data.rcNumber) {
    cmds.push(...encode(`RC: ${data.rcNumber}`));
    cmds.push(LF);
  }
  cmds.push(LF);

  // ═══════════════════════════════════════
  // DASHED SEPARATOR
  // ═══════════════════════════════════════
  cmds.push(ESC, 0x61, 0x00); // Left align
  cmds.push(...encode(dashedLine(W)));
  cmds.push(LF);

  // ═══════════════════════════════════════
  // INVOICE METADATA
  // ═══════════════════════════════════════
  cmds.push(...encode(`INV NO: ${data.receiptNumber}`));
  cmds.push(LF);
  cmds.push(...encode(`DATE : ${data.date}`));
  cmds.push(LF);
  if (data.cashierName) {
    cmds.push(...encode(`CASHIER: ${data.cashierName}`));
    cmds.push(LF);
  }
  cmds.push(...encode(`CUSTOMER: ${data.customerName}`));
  cmds.push(LF);

  // Dashed separator
  cmds.push(...encode(dashedLine(W)));
  cmds.push(LF);

  // ═══════════════════════════════════════
  // ITEMS TABLE HEADER
  // ═══════════════════════════════════════
  // Layout: ITEM (left) | QTY (center) | TOTAL (₦) (right)
  const itemW = Math.floor(W * 0.44);   // ~14
  const qtyW = Math.floor(W * 0.25);    // ~8
  const totalW = W - itemW - qtyW;      // ~10

  cmds.push(ESC, 0x45, 0x01); // Bold on
  cmds.push(...encode(
    padRight("ITEM", itemW) +
    padRight("QTY", qtyW) +
    padLeft(`TOTAL (${sym})`, totalW)
  ));
  cmds.push(ESC, 0x45, 0x00); // Bold off
  cmds.push(LF);

  // Dashed separator
  cmds.push(...encode(dashedLine(W)));
  cmds.push(LF);

  // ═══════════════════════════════════════
  // LINE ITEMS
  // ═══════════════════════════════════════
  for (const item of data.items) {
    // Main row: Name | Qty Unit | Total
    const qtyStr = `${item.quantity} ${(item.unit_name || "PCS").toUpperCase()}`;
    const totalStr = formatMoney(item.total, sym).replace(sym, ""); // Remove symbol, already in header

    cmds.push(...encode(
      padRight(item.name, itemW) +
      padRight(qtyStr, qtyW) +
      padLeft(totalStr, totalW)
    ));
    cmds.push(LF);

    // Sub-line: @price / unit
    const unitPriceStr = `@${formatMoney(item.unit_price, sym).replace(sym, "")} / ${item.unit_name || "pcs"}`;
    cmds.push(...encode("  " + unitPriceStr));
    cmds.push(LF);
  }

  // Dashed separator
  cmds.push(...encode(dashedLine(W)));
  cmds.push(LF);

  // ═══════════════════════════════════════
  // TOTALS SECTION
  // ═══════════════════════════════════════
  const labelW = Math.max(12, W - 14);
  const valueW = W - labelW;

  // Subtotal
  cmds.push(...encode(
    padRight("SUBTOTAL:", labelW) +
    padLeft(formatMoney(data.subtotal, sym), valueW)
  ));
  cmds.push(LF);

  if (data.discount > 0) {
    cmds.push(...encode(
      padRight("DISCOUNT:", labelW) +
      padLeft(`-${formatMoney(data.discount, sym)}`, valueW)
    ));
    cmds.push(LF);
  }

  if (data.tax > 0) {
    cmds.push(...encode(
      padRight("VAT/TAX:", labelW) +
      padLeft(`+${formatMoney(data.tax, sym)}`, valueW)
    ));
    cmds.push(LF);
  }

  // Dashed separator before TOTAL
  cmds.push(...encode(dashedLine(W)));
  cmds.push(LF);

  // TOTAL (bold, double width)
  cmds.push(ESC, 0x45, 0x01); // Bold
  cmds.push(...encode(
    padRight("TOTAL:", labelW) +
    padLeft(formatMoney(data.total, sym), valueW)
  ));
  cmds.push(ESC, 0x45, 0x00); // Bold off
  cmds.push(LF);

  // Paid Amount
  if (data.amountPaid !== undefined) {
    cmds.push(...encode(
      padRight("PAID AMOUNT:", labelW) +
      padLeft(formatMoney(data.amountPaid, sym), valueW)
    ));
    cmds.push(LF);
  }

  // Change / Balance
  if (data.change !== undefined || data.balanceDue !== undefined) {
    const changeVal = data.change ?? 0;
    const balanceVal = data.balanceDue ?? 0;

    if (changeVal > 0) {
      cmds.push(ESC, 0x45, 0x01);
      cmds.push(...encode(
        padRight("CHANGE DUE:", labelW) +
        padLeft(formatMoney(changeVal, sym), valueW)
      ));
      cmds.push(ESC, 0x45, 0x00);
      cmds.push(LF);
    } else if (balanceVal > 0) {
      cmds.push(ESC, 0x45, 0x01);
      cmds.push(...encode(
        padRight("DEBT DUE:", labelW) +
        padLeft(formatMoney(balanceVal, sym), valueW)
      ));
      cmds.push(ESC, 0x45, 0x00);
      cmds.push(LF);
    } else {
      cmds.push(ESC, 0x45, 0x01);
      cmds.push(...encode(
        padRight("BALANCE:", labelW) +
        padLeft(`${formatMoney(0, sym)} (Paid)`, valueW)
      ));
      cmds.push(ESC, 0x45, 0x00);
      cmds.push(LF);
    }
  }

  // Dashed separator
  cmds.push(...encode(dashedLine(W)));
  cmds.push(LF);

  // Pay Method
  cmds.push(...encode(
    padRight("PAY METHOD:", labelW) +
    padLeft(data.paymentMethod.toUpperCase(), valueW)
  ));
  cmds.push(LF);

  // Dashed separator
  cmds.push(...encode(dashedLine(W)));
  cmds.push(LF);

  // ═══════════════════════════════════════
  // BARCODE (native ESC/POS)
  // ═══════════════════════════════════════
  cmds.push(ESC, 0x61, 0x01); // Center
  cmds.push(GS, 0x77, 0x02);  // Barcode width
  cmds.push(GS, 0x68, 0x3c);  // Height 60 dots
  cmds.push(GS, 0x6b, 0x49);  // CODE128
  const bcData = encode(data.receiptNumber);
  cmds.push(bcData.length);
  cmds.push(...bcData);
  cmds.push(LF);

  // ═══════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════
  cmds.push(ESC, 0x61, 0x01); // Center
  cmds.push(...encode("Thank you for shopping with us!"));
  cmds.push(LF);
  cmds.push(...encode("Keep this receipt for returns/refunds."));
  cmds.push(LF, LF, LF);

  // Feed & cut
  cmds.push(ESC, 0x64, 0x03); // Feed 3 lines
  cmds.push(GS, 0x56, 0x01);  // Partial cut

  return new Uint8Array(cmds);
}

export { padRight, padLeft };
