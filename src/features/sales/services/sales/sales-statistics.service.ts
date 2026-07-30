import { supabase } from "../../../../api/supabase";
import type { SalesStats } from "../../types/sale";

export async function getSalesStatistics(): Promise<SalesStats> {
  const { data: sales, error } = await supabase
    .from("sales")
    .select(`
      id,
      payable_amount,
      amount_paid,
      status,
      items:sale_items(
        quantity,
        cost_price
      )
    `);

  if (error) throw error;

  const completed =
    sales?.filter((sale) => sale.status === "COMPLETED") ?? [];

  const refunded =
    sales?.filter((sale) => sale.status === "REFUNDED") ?? [];

  const totalRevenue = completed.reduce(
    (sum, sale) => sum + Number(sale.payable_amount),
    0
  );

  const totalSales = completed.length;

  let totalCost = 0;

  completed.forEach((sale) => {
    sale.items?.forEach((item: any) => {
      totalCost += Number(item.quantity) * Number(item.cost_price);
    });
  });

  const netProfit = totalRevenue - totalCost;

  const averageOrderValue =
    totalSales === 0 ? 0 : totalRevenue / totalSales;

  const totalOutstandingBalance = completed.reduce((sum, sale) => {
    const paid = Number(sale.amount_paid ?? sale.payable_amount);
    const debt = Math.max(0, Number(sale.payable_amount) - paid);
    return sum + debt;
  }, 0);

  return {
    totalSales,
    totalRevenue,
    netProfit,
    averageOrderValue,
    refundedSalesCount: refunded.length,
    totalOutstandingBalance,
  };
}