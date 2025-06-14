
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { DashboardMetrics, ChartDataPoint, ChannelMetrics } from "@/types/dashboard";

export const generateSampleData = (dateRange?: DateRange): DashboardMetrics => {
  // Generate sample order revenue
  const orderRevenue = Math.round(Math.random() * 100000) + 50000;
  
  // Generate sample contribution margin (about 30-45% of revenue)
  const contributionMargin = Math.round(orderRevenue * (Math.random() * 0.15 + 0.3));
  
  // Calculate margin percentage
  const marginPercentage = (contributionMargin / orderRevenue) * 100;
  
  // Generate sample channel metrics
  const sampleChannels = ["Mercado Libre", "Amazon", "Shopify", "Coppel", "Liverpool", "Walmart"];
  const channelMetrics: ChannelMetrics[] = sampleChannels.map(channel => {
    // Generate sample revenue for this channel (roughly dividing the total)
    const channelRevenue = Math.round((Math.random() * 0.3 + 0.05) * orderRevenue);
    const channelOrders = Math.floor(Math.random() * 40) + 10;
    const channelAOV = channelOrders > 0 ? Math.round(channelRevenue / channelOrders) : 0;
    const channelContribution = Math.round(channelRevenue * (Math.random() * 0.2 + 0.2));
    const channelMarginPercentage = channelRevenue > 0 ? (channelContribution / channelRevenue) * 100 : 0;
    
    return {
      name: channel,
      revenue: channelRevenue,
      orders: channelOrders,
      aov: channelAOV,
      contributionMargin: channelContribution,
      marginPercentage: channelMarginPercentage,
      revenueChange: Math.round((Math.random() * 60) - 20),
      ordersChange: Math.round((Math.random() * 50) - 15),
      aovChange: Math.round((Math.random() * 40) - 10),
      contributionMarginChange: Math.round((Math.random() * 50) - 10),
      marginPercentageChange: Math.round((Math.random() * 30) - 10)
    };
  });
  
  // Generate sample metrics
  return {
    // Contribution margin metrics
    contributionMargin,
    contributionMarginChange: Math.round((Math.random() * 30) - 5),
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
    
    // Channel metrics
    channelMetrics,
    
    // Chart data
    chartData: generateChartData(dateRange),
    
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
      target: Math.round(sales * (Math.random() * 0.3 + 1.1))
    });
    
    currentDate = addDays(currentDate, 1);
  }
  
  return chartData;
}
