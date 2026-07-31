export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  netProfit: number;
  averageOrderValue?: number;
  totalOutstandingBalance?: number;
  totalPaidSales?: number;
  totalPartialSales?: number;
  totalRefundedSales?: number;
  refundedSalesCount?: number;
  totalCancelledSales?: number;
}