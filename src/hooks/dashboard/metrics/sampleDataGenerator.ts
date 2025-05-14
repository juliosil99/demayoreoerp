
import { addDays, format, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { DashboardMetrics, ChartDataPoint } from "@/types/dashboard";

export const generateSampleData = (dateRange?: DateRange): DashboardMetrics => {
  // Base metrics
  const orderRevenue = Math.round(Math.random() * 50000) + 20000;
  const uniqueOrderCount = Math.round(Math.random() * 100) + 50; // Generate unique order count
  const adSpend = Math.round(orderRevenue * (Math.random() * 0.3 + 0.1));
  const mer = orderRevenue > 0 ? Number((adSpend / orderRevenue * 100).toFixed(2)) : 0;
  const aov = uniqueOrderCount > 0 ? Number((orderRevenue / uniqueOrderCount).toFixed(2)) : 0;

  // Generate chart data based on date range
  const chartData = generateChartData(dateRange);

  // Generate percentage changes
  const revenueChange = generatePercentageChange();
  const ordersChange = generatePercentageChange();
  const adSpendChange = generatePercentageChange();
  const merChange = generatePercentageChange();
  const aovChange = generatePercentageChange();
  
  // Returming customer metrics
  const returningRevenue = orderRevenue * (Math.random() * 0.5 + 0.3);
  const returningOrders = Math.round(uniqueOrderCount * (Math.random() * 0.4 + 0.3));
  const returningAOV = returningOrders > 0 ? returningRevenue / returningOrders : 0;
  const repeatRate = (returningOrders / uniqueOrderCount) * 100;

  // New customer metrics
  const newCustomerRevenue = orderRevenue - returningRevenue;
  const newCustomerOrders = uniqueOrderCount - returningOrders;
  const newCustomerAOV = newCustomerOrders > 0 ? newCustomerRevenue / newCustomerOrders : 0;
  const cac = newCustomerOrders > 0 ? adSpend / newCustomerOrders : 0;

  // Generate paid performance metrics
  const paidRevenue = orderRevenue * (Math.random() * 0.7 + 0.2);
  const paidOrders = Math.floor(uniqueOrderCount * (Math.random() * 0.6 + 0.3));
  const paidAOV = paidOrders > 0 ? paidRevenue / paidOrders : 0;
  const paidCAC = paidOrders > 0 ? adSpend / paidOrders : 0;
  const pamer = paidRevenue > 0 ? (adSpend / paidRevenue) * 100 : 0;

  // Add contribution margin metric
  const contributionMargin = orderRevenue - adSpend - Math.random() * 10000;

  return {
    contributionMargin,
    orderRevenue,
    adSpend,
    mer,
    aov,
    orders: uniqueOrderCount, // This is now unique order count
    chartData,
    revenueChange,
    ordersChange,
    adSpendChange,
    merChange,
    aovChange,
    // Returning customer metrics
    returningRevenue,
    returningOrders,
    returningAOV,
    repeatRate,
    returningRevenueChange: generatePercentageChange(),
    returningOrdersChange: generatePercentageChange(),
    returningAOVChange: generatePercentageChange(),
    repeatRateChange: generatePercentageChange(),
    // New customer metrics
    newCustomerRevenue,
    newCustomerOrders,
    newCustomerAOV,
    cac,
    newCustomerRevenueChange: generatePercentageChange(),
    newCustomerOrdersChange: generatePercentageChange(),
    newCustomerAOVChange: generatePercentageChange(),
    cacChange: generatePercentageChange(),
    // Paid performance metrics
    paidRevenue,
    paidOrders,
    paidAOV,
    paidCAC,
    pamer,
    paidRevenueChange: generatePercentageChange(),
    paidOrdersChange: generatePercentageChange(),
    paidAOVChange: generatePercentageChange(),
    paidCACChange: generatePercentageChange(),
    pamerChange: generatePercentageChange(),
    // Legacy metrics
    yesterdaySales: Math.round(orderRevenue / 30),
    unreconciled: Math.round(Math.random() * 5000) + 1000,
    receivablesPending: Math.round(Math.random() * 10000) + 2000,
    salesCount: Math.round(Math.random() * 200) + 100,
    unreconciledCount: Math.round(Math.random() * 50) + 10,
    receivablesCount: Math.round(Math.random() * 30) + 5
  };
};

const generatePercentageChange = () => {
  return Number((Math.random() * 40 - 20).toFixed(2));
};

const generateChartData = (dateRange?: DateRange): ChartDataPoint[] => {
  // Default to last 30 days if no date range provided
  const endDate = dateRange?.to || new Date();
  const startDate = dateRange?.from || subMonths(new Date(), 1);
  
  const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const chartData: ChartDataPoint[] = [];
  
  // Create a growing trend for sales and slightly fluctuating ad spend
  let baseSales = Math.round(Math.random() * 1000) + 500;
  let baseAdSpend = baseSales * (Math.random() * 0.3 + 0.1);
  const targetValue = baseSales * 1.5;
  
  for (let i = 0; i < days; i++) {
    const currentDate = addDays(startDate, i);
    
    // Gradually increase sales with some random fluctuation
    baseSales = baseSales * (1 + (Math.random() * 0.04 - 0.01));
    // Ad spend follows sales but with more volatility
    baseAdSpend = baseAdSpend * (1 + (Math.random() * 0.08 - 0.03));
    
    chartData.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      sales: Math.round(baseSales),
      adSpend: Math.round(baseAdSpend),
      target: Math.round(targetValue)
    });
  }
  
  return chartData;
};
