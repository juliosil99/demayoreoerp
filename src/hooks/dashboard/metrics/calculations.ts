
import { DashboardMetrics } from "@/types/dashboard";

export const calculatePercentChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const calculateChanges = (current: any, previous: any | null) => {
  if (!previous) {
    return {
      revenueChange: 0,
      contributionMarginChange: 0,
      marginPercentageChange: 0,
      ordersChange: 0,
      aovChange: 0,
      adSpendChange: 0,
      merChange: 0,
      returningRevenueChange: 0,
      returningOrdersChange: 0,
      returningAOVChange: 0,
      repeatRateChange: 0,
      newCustomerRevenueChange: 0,
      newCustomerOrdersChange: 0,
      newCustomerAOVChange: 0,
      cacChange: 0,
      paidRevenueChange: 0,
      paidOrdersChange: 0,
      paidAOVChange: 0,
      paidCACChange: 0,
      pamerChange: 0
    };
  }

  return {
    revenueChange: calculatePercentChange(Number(current.total_revenue || 0), Number(previous.total_revenue || 0)),
    contributionMarginChange: calculatePercentChange(Number(current.total_profit || 0), Number(previous.total_profit || 0)),
    marginPercentageChange: calculatePercentChange(Number(current.margin_percentage || 0), Number(previous.margin_percentage || 0)),
    ordersChange: calculatePercentChange(Number(current.total_orders || 0), Number(previous.total_orders || 0)),
    aovChange: calculatePercentChange(Number(current.aov || 0), Number(previous.aov || 0)),
    adSpendChange: 0,
    merChange: 0,
    returningRevenueChange: 0,
    returningOrdersChange: 0,
    returningAOVChange: 0,
    repeatRateChange: 0,
    newCustomerRevenueChange: calculatePercentChange(Number(current.total_revenue || 0), Number(previous.total_revenue || 0)),
    newCustomerOrdersChange: calculatePercentChange(Number(current.total_orders || 0), Number(previous.total_orders || 0)),
    newCustomerAOVChange: calculatePercentChange(Number(current.aov || 0), Number(previous.aov || 0)),
    cacChange: 0,
    paidRevenueChange: 0,
    paidOrdersChange: 0,
    paidAOVChange: 0,
    paidCACChange: 0,
    pamerChange: 0
  };
};

export const getEmptyMetrics = (): DashboardMetrics => ({
  // Main metrics
  orderRevenue: 0,
  adSpend: 0,
  mer: 0,
  aov: 0,
  orders: 0,
  
  // Change percentages
  revenueChange: 0,
  adSpendChange: 0,
  merChange: 0,
  aovChange: 0,
  ordersChange: 0,
  
  // Contribution margin
  contributionMargin: 0,
  contributionMarginChange: 0,
  marginPercentage: 0,
  marginPercentageChange: 0,
  
  // Chart data
  chartData: [],
  
  // Channel metrics
  channelMetrics: [],
  
  // Customer metrics
  returningRevenue: 0,
  returningOrders: 0,
  returningAOV: 0,
  repeatRate: 0,
  returningRevenueChange: 0,
  returningOrdersChange: 0,
  returningAOVChange: 0,
  repeatRateChange: 0,
  
  newCustomerRevenue: 0,
  newCustomerOrders: 0,
  newCustomerAOV: 0,
  cac: 0,
  newCustomerRevenueChange: 0,
  newCustomerOrdersChange: 0,
  newCustomerAOVChange: 0,
  cacChange: 0,
  
  // Paid performance metrics
  paidRevenue: 0,
  paidOrders: 0,
  paidAOV: 0,
  paidCAC: 0,
  pamer: 0,
  paidRevenueChange: 0,
  paidOrdersChange: 0,
  paidAOVChange: 0,
  paidCACChange: 0,
  pamerChange: 0,
  
  // Legacy metrics
  yesterdaySales: 0,
  unreconciled: 0,
  receivablesPending: 0,
  salesCount: 0,
  unreconciledCount: 0,
  receivablesCount: 0
});
