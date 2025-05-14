export interface ChartDataPoint {
  date: string;
  sales: number;
  target?: number;
}

export interface DashboardMetrics {
  // New contribution margin metrics
  contributionMargin: number;
  contributionMarginChange: number; // Added for percentage change
  marginPercentage: number;
  marginPercentageChange: number;

  // Top-level metrics
  orderRevenue: number;
  adSpend: number;
  mer: number;
  aov: number;
  orders: number;
  
  // Change percentages
  revenueChange: number;
  adSpendChange: number;
  merChange: number;
  aovChange: number;
  ordersChange: number;
  
  // Chart data
  chartData: ChartDataPoint[];
  
  // Returning customer metrics
  returningRevenue: number;
  returningOrders: number;
  returningAOV: number;
  repeatRate: number;
  returningRevenueChange: number;
  returningOrdersChange: number;
  returningAOVChange: number;
  repeatRateChange: number;
  
  // New customer metrics
  newCustomerRevenue: number;
  newCustomerOrders: number;
  newCustomerAOV: number;
  cac: number;
  newCustomerRevenueChange: number;
  newCustomerOrdersChange: number;
  newCustomerAOVChange: number;
  cacChange: number;
  
  // Paid performance metrics
  paidRevenue: number;
  paidOrders: number;
  paidAOV: number;
  paidCAC: number;
  pamer: number;
  paidRevenueChange: number;
  paidOrdersChange: number;
  paidAOVChange: number;
  paidCACChange: number;
  pamerChange: number;
  
  // Legacy metrics for backward compatibility
  yesterdaySales: number;
  unreconciled: number;
  receivablesPending: number;
  salesCount: number;
  unreconciledCount: number;
  receivablesCount: number;
}
