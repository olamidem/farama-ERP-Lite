import { supabase } from "../../../../api/supabase";
import type { Sale } from "../../types/sale";

export interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  totalDiscount: number;
  totalTax: number;
  totalRefunds: number;
  outstandingBalance: number;
}

export interface PaymentBreakdown {
  CASH: number;
  POS: number;
  TRANSFER: number;
  WALLET: number;
  SPLIT: number;
  DEPOSIT: number;
}

export interface BestSellingProduct {
  product_id: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface CashierPerformance {
  cashier_id: string;
  cashier_name: string;
  sales: number;
  revenue: number;
}

export interface SalesTrend {
  date: string;
  revenue: number;
  sales: number;
}

async function fetchSales(
  startDate?: string,
  endDate?: string
): Promise<Sale[]> {
  let query = supabase
    .from("sales")
    .select(`
      *,
      items:sale_items(
        *,
        product:products(name)
      )
    `)
    .eq("status", "COMPLETED")
    .order("created_at");

  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  if (endDate) {
    query = query.lte("created_at", endDate);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []) as Sale[];
}

/* -------------------------------------------------------------------------- */
/* Summary */
/* -------------------------------------------------------------------------- */

export async function getSalesSummary(
  startDate?: string,
  endDate?: string
): Promise<SalesSummary> {
  const sales = await fetchSales(startDate, endDate);

  let revenue = 0;
  let discount = 0;
  let tax = 0;
  let refunds = 0;
  let profit = 0;
  let outstanding = 0;

  for (const sale of sales) {
    revenue += sale.payable_amount;
    discount += sale.discount_amount;
    tax += sale.tax_amount;

    const paid =
      sale.amount_paid ?? sale.payable_amount;

    outstanding += Math.max(
      0,
      sale.payable_amount - paid
    );

    if (sale.items) {
      for (const item of sale.items) {
        profit +=
          item.total_price -
          item.quantity * item.cost_price;
      }
    }
  }

  return {
    totalSales: sales.length,
    totalRevenue: revenue,
    totalProfit: profit,
    totalDiscount: discount,
    totalTax: tax,
    totalRefunds: refunds,
    outstandingBalance: outstanding,
  };
}

/* -------------------------------------------------------------------------- */
/* Payment Breakdown */
/* -------------------------------------------------------------------------- */

export async function getPaymentBreakdown(
  startDate?: string,
  endDate?: string
): Promise<PaymentBreakdown> {
  const sales = await fetchSales(startDate, endDate);

  const result: PaymentBreakdown = {
    CASH: 0,
    POS: 0,
    TRANSFER: 0,
    WALLET: 0,
    SPLIT: 0,
    DEPOSIT: 0,
  };

  sales.forEach((sale) => {
    result[sale.payment_method] +=
      sale.payable_amount;
  });

  return result;
}

/* -------------------------------------------------------------------------- */
/* Daily Sales Trend */
/* -------------------------------------------------------------------------- */

export async function getSalesTrend(
  startDate?: string,
  endDate?: string
): Promise<SalesTrend[]> {
  const sales = await fetchSales(startDate, endDate);

  const grouped = new Map<
    string,
    SalesTrend
  >();

  sales.forEach((sale) => {
    const date =
      sale.created_at.slice(0, 10);

    if (!grouped.has(date)) {
      grouped.set(date, {
        date,
        revenue: 0,
        sales: 0,
      });
    }

    const row = grouped.get(date)!;

    row.revenue += sale.payable_amount;
    row.sales++;
  });

  return [...grouped.values()];
}

/* -------------------------------------------------------------------------- */
/* Best Selling Products */
/* -------------------------------------------------------------------------- */

export async function getBestSellingProducts(
  limit = 10
): Promise<BestSellingProduct[]> {
  const sales = await fetchSales();

  const products = new Map<
    string,
    BestSellingProduct
  >();

  sales.forEach((sale) => {
    sale.items?.forEach((item) => {
      const id = item.product_id;

      if (!products.has(id)) {
        products.set(id, {
          product_id: id,
          name:
            item.product?.name ??
            "Unknown",
          quantity: 0,
          revenue: 0,
        });
      }

      const row = products.get(id)!;

      row.quantity += item.quantity;

      row.revenue += item.total_price;
    });
  });

  return [...products.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* Cashier Performance */
/* -------------------------------------------------------------------------- */

export async function getCashierPerformance(): Promise<
  CashierPerformance[]
> {
  const sales = await fetchSales();

  const result = new Map<
    string,
    CashierPerformance
  >();

  sales.forEach((sale) => {
    const id =
      sale.created_by ?? "Unknown";

    if (!result.has(id)) {
      result.set(id, {
        cashier_id: id,
        cashier_name: id,
        sales: 0,
        revenue: 0,
      });
    }

    const row = result.get(id)!;

    row.sales++;

    row.revenue += sale.payable_amount;
  });

  return [...result.values()];
}