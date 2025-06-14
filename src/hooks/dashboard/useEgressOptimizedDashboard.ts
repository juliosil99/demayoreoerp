
import { useOptimizedDashboardMetrics } from "./useOptimizedDashboardMetrics";
import { useOptimizedSalesData } from "./useOptimizedSalesData";
import { DateRange } from "react-day-picker";
import { useMemo } from "react";

// Combined hook that uses all optimized queries for the dashboard
export function useEgressOptimizedDashboard(dateRange: DateRange | undefined) {
  // Use optimized metrics from SQL functions
  const {
    metricsData,
    channelMetrics,
    chartData,
    channelDistribution,
    isLoading: metricsLoading
  } = useOptimizedDashboardMetrics(dateRange);

  // Use optimized sales data with minimal columns
  const { data: salesData, isLoading: salesLoading } = useOptimizedSalesData(dateRange);

  // Calculate additional metrics from optimized data
  const combinedMetrics = useMemo(() => {
    if (!metricsData) return null;

    // Use the pre-calculated metrics from SQL functions
    const contributionMargin = metricsData.totalProfit;
    const contributionMarginChange = 0; // Would need historical comparison
    
    return {
      // Main metrics from optimized SQL functions
      orderRevenue: metricsData.totalRevenue,
      orders: metricsData.totalOrders,
      aov: metricsData.aov,
      contributionMargin,
      marginPercentage: metricsData.marginPercentage,
      
      // Changes (would need historical data for accurate calculation)
      revenueChange: 0,
      ordersChange: 0,
      aovChange: 0,
      contributionMarginChange,
      marginPercentageChange: 0,
      
      // Chart data from optimized query
      chartData: chartData || [],
      
      // Channel metrics from optimized query
      channelMetrics: channelMetrics || [],
      
      // Legacy metrics for backward compatibility
      adSpend: 0,
      mer: 0,
      merChange: 0,
      adSpendChange: 0,
      yesterdaySales: 0,
      unreconciled: 0,
      receivablesPending: 0,
      salesCount: metricsData.totalOrders,
      unreconciledCount: 0,
      receivablesCount: 0
    };
  }, [metricsData, chartData, channelMetrics]);

  const isLoading = metricsLoading || salesLoading;

  return {
    combinedData: combinedMetrics,
    salesData,
    metricsData,
    channelDistribution,
    isLoading,
    error: null
  };
}
