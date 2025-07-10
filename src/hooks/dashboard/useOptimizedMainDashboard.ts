
import { useOptimizedDashboardMetrics } from "./useOptimizedDashboardMetrics";
import { DateRange } from "react-day-picker";
import { useMemo } from "react";
import { ChannelMetrics } from "@/types/dashboard";

// Optimized hook specifically for main dashboard - NO heavy sales data
export function useOptimizedMainDashboard(dateRange: DateRange | undefined) {
  // Only use optimized metrics from SQL functions - NO raw sales data
  const {
    metricsData,
    channelMetrics,
    chartData,
    isLoading: metricsLoading
  } = useOptimizedDashboardMetrics(dateRange);

  // Calculate combined metrics using only pre-aggregated data
  const combinedMetrics = useMemo(() => {
    if (!metricsData) {
      return null;
    }

    // Transform channel metrics to include change properties
    const transformedChannelMetrics: ChannelMetrics[] = (channelMetrics || []).map(channel => ({
      name: channel.name,
      revenue: channel.revenue,
      orders: channel.orders,
      aov: channel.aov,
      contributionMargin: channel.contributionMargin,
      marginPercentage: channel.marginPercentage,
      // Add missing change properties with default values
      revenueChange: 0,
      ordersChange: 0,
      aovChange: 0,
      contributionMarginChange: 0,
      marginPercentageChange: 0
    }));

    // Use the pre-calculated metrics from SQL functions
    const contributionMargin = metricsData.totalProfit;
    const contributionMarginChange = 0; // Would need historical comparison
    
    const finalResult = {
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
      
      // Channel metrics with proper typing
      channelMetrics: transformedChannelMetrics,
      
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
    
    return finalResult;
  }, [metricsData, chartData, channelMetrics]);

  return {
    combinedData: combinedMetrics,
    isLoading: metricsLoading,
    error: null
  };
}
