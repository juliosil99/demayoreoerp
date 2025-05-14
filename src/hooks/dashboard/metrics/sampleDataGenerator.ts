
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { DashboardMetrics, ChartDataPoint } from "@/types/dashboard";

export const generateSampleData = (dateRange?: DateRange): DashboardMetrics => {
  // Generate sample order revenue
  const orderRevenue = Math.round(Math.random() * 100000) + 50000;
  
  // Generate sample contribution margin (about 30-45% of revenue)
  const contributionMargin = Math.round(orderRevenue * (Math.random() * 0.15 + 0.3));
  
  // Calculate margin percentage
  const marginPercentage = (contributionMargin / orderRevenue) * 100;
  
  // Generate sample metrics
  return {
    // New contribution margin metrics
    contributionMargin,
    contributionMarginChange: Math.round((Math.random() * 30) - 5), // New field for % change
    marginPercentage,
    marginPercentageChange: Math.round((Math.random() * 20) - 10),
    
    // Main metrics
    orderRevenue,
    adSpend: Math.round(orderRevenue * 0.2),
    mer: Math.round((Math.random() * 3) + 1),
    aov: Math.round(orderRevenue / Math.floor(Math.random() * 100) + 200),
    orders: Math.floor(Math.random() * 100) + 200,
    
    // Change percentages
    revenueChange: Math.round((Math.random() * 30) - 5),
    adSpendChange: Math.round((Math.random() * 30) - 10),
    merChange: Math.round((Math.random() * 20) - 5),
    aovChange: Math.round((Math.random() * 15) - 5),
    ordersChange: Math.round((Math.random() * 25) - 5),
    
    // Chart data
    chartData: generateChartData(dateRange),
    
    // Returning customer metrics
    returningRevenue: Math.round(orderRevenue * 0.4),
    returningOrders: Math.floor(Math.random() * 50) + 100,
    returningAOV: Math.round(orderRevenue * 0.4 / (Math.floor(Math.random() * 50) + 100)),
    repeatRate: Math.random() * 0.3 + 0.2,
    returningRevenueChange: Math.round((Math.random() * 30) - 5),
    returningOrdersChange: Math.round((Math.random() * 25) - 5),
    returningAOVChange: Math.round((Math.random() * 15) - 5),
    repeatRateChange: Math.round((Math.random() * 10) - 2),
    
    // New customer metrics
    newCustomerRevenue: Math.round(orderRevenue * 0.6),
    newCustomerOrders: Math.floor(Math.random() * 50) + 100,
    newCustomerAOV: Math.round(orderRevenue * 0.6 / (Math.floor(Math.random() * 50) + 100)),
    cac: Math.round(Math.random() * 300) + 200,
    newCustomerRevenueChange: Math.round((Math.random() * 40) - 10),
    newCustomerOrdersChange: Math.round((Math.random() * 35) - 5),
    newCustomerAOVChange: Math.round((Math.random() * 20) - 10),
    cacChange: Math.round((Math.random() * 25) - 15),
    
    // Paid performance metrics
    paidRevenue: Math.round(orderRevenue * 0.7),
    paidOrders: Math.floor(Math.random() * 70) + 150,
    paidAOV: Math.round(orderRevenue * 0.7 / (Math.floor(Math.random() * 70) + 150)),
    paidCAC: Math.round(Math.random() * 250) + 150,
    pamer: Math.round((Math.random() * 5) + 2),
    paidRevenueChange: Math.round((Math.random() * 35) - 5),
    paidOrdersChange: Math.round((Math.random() * 30) - 5),
    paidAOVChange: Math.round((Math.random() * 20) - 10),
    paidCACChange: Math.round((Math.random() * 20) - 15),
    pamerChange: Math.round((Math.random() * 15) - 5),
    
    // Legacy metrics for backward compatibility
    yesterdaySales: Math.round(Math.random() * 10000) + 5000,
    unreconciled: Math.round(Math.random() * 5000) + 1000,
    receivablesPending: Math.round(Math.random() * 8000) + 2000,
    salesCount: Math.floor(Math.random() * 50) + 30,
    unreconciledCount: Math.floor(Math.random() * 15) + 5,
    receivablesCount: Math.floor(Math.random() * 20) + 8
  };
};

function generateChartData(dateRange?: DateRange): ChartDataPoint[] {
  const today = new Date();
  const startDate = dateRange?.from || addDays(today, -30);
  const endDate = dateRange?.to || today;
  
  let currentDate = new Date(startDate);
  const chartData: ChartDataPoint[] = [];
  
  while (currentDate <= endDate) {
    const sales = Math.round(Math.random() * 8000) + 2000;
    chartData.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      sales,
      adSpend: Math.round(sales * (Math.random() * 0.3 + 0.1)),
      target: Math.round(sales * (Math.random() * 0.3 + 1.1))
    });
    
    currentDate = addDays(currentDate, 1);
  }
  
  return chartData;
}
