
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { DashboardMetrics, ChartDataPoint } from "@/types/dashboard";

// Function to generate sample data for UI testing
export const generateSampleData = (dateRange?: DateRange): DashboardMetrics => {
  const orderRevenue = 258943.75;
  const adSpend = 38419.25;
  const orders = 3245;
  const aov = orderRevenue / orders;
  const mer = orderRevenue / adSpend;
  
  const returningRevenue = orderRevenue * 0.65;
  const returningOrders = orders * 0.6;
  const returningAOV = returningRevenue / returningOrders;
  const repeatRate = 32.5;
  
  const newCustomerRevenue = orderRevenue * 0.35;
  const newCustomerOrders = orders * 0.4;
  const newCustomerAOV = newCustomerRevenue / newCustomerOrders;
  const cac = adSpend / newCustomerOrders;
  
  const paidRevenue = orderRevenue * 0.7;
  const paidOrders = orders * 0.72;
  const paidAOV = paidRevenue / paidOrders;
  const paidCAC = adSpend / paidOrders;
  const pamer = paidRevenue / adSpend;
  
  // Create chart data
  const chartData: ChartDataPoint[] = generateChartData(dateRange);
  
  // Default contribution margin if real data isn't available
  const contributionMargin = orderRevenue * 0.35;
  
  return {
    contributionMargin,
    orderRevenue,
    adSpend,
    mer,
    aov,
    orders,
    revenueChange: 15.4,
    adSpendChange: 8.2,
    merChange: 6.7,
    aovChange: 3.2,
    ordersChange: 12.3,
    chartData,
    returningRevenue,
    returningOrders,
    returningAOV,
    repeatRate,
    returningRevenueChange: 18.7,
    returningOrdersChange: 14.5,
    returningAOVChange: 3.8,
    repeatRateChange: 5.2,
    newCustomerRevenue,
    newCustomerOrders,
    newCustomerAOV,
    cac,
    newCustomerRevenueChange: 9.5,
    newCustomerOrdersChange: 7.3,
    newCustomerAOVChange: 2.1,
    cacChange: -3.4,
    paidRevenue,
    paidOrders,
    paidAOV,
    paidCAC,
    pamer,
    paidRevenueChange: 16.8,
    paidOrdersChange: 14.9,
    paidAOVChange: 2.5,
    paidCACChange: -4.2,
    pamerChange: 8.3,
    // Legacy metrics
    yesterdaySales: orderRevenue / 30,
    unreconciled: 18250.43,
    receivablesPending: 42680.19,
    salesCount: orders / 30,
    unreconciledCount: 48,
    receivablesCount: 127
  };
};

// Helper function to generate chart data based on date range
const generateChartData = (dateRange?: DateRange): ChartDataPoint[] => {
  const chartData: ChartDataPoint[] = [];
  const start = dateRange?.from ? new Date(dateRange.from) : subDays(new Date(), 30);
  const end = dateRange?.to ? new Date(dateRange.to) : new Date();
  
  const orderRevenue = 258943.75;
  const adSpend = 38419.25;
  
  let currentDate = new Date(start);
  while (currentDate <= end) {
    const dailyRevenue = orderRevenue / 30 * (0.7 + Math.random() * 0.6);
    const dailyAdSpend = adSpend / 30 * (0.8 + Math.random() * 0.4);
    
    chartData.push({
      date: format(currentDate, 'MM/dd'),
      sales: Math.round(dailyRevenue),
      adSpend: Math.round(dailyAdSpend)
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return chartData;
};
