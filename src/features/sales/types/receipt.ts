export interface ReceiptItem {
  name: string;
  unit_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface ReceiptData {
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  receiptNumber: string;
  date: string;
  cashierName?: string;
  customerName?: string;
  customerPhone?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  change: number;
  paymentMethod: string;
}