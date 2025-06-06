import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { differenceInDays, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DashboardMetrics, ChartDataPoint, ChannelMetrics } from "@/types/dashboard";
import { formatDateForQuery } from "@/utils/dateUtils";

export const useFetchSalesData = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchSalesMetrics = useCallback(async (dateRange: DateRange): Promise<DashboardMetrics> => {
    if (!dateRange.from || !dateRange.to) {
      return getEmptyMetrics();
    }

    setIsLoading(true);
    
    try {
      const fromDate = formatDateForQuery(dateRange.from);
      const toDate = formatDateForQuery(dateRange.to);
      
      // Fetch current period metrics using SQL function with simplified parameters
      const { data: currentMetrics, error: currentError } = await supabase.rpc('get_dashboard_metrics', {
        p_start_date: fromDate,
        p_end_date: toDate
      });
      
      if (currentError) {
        console.error("Error fetching current dashboard metrics:", currentError);
        toast.error("Error al cargar métricas del dashboard");
        return getEmptyMetrics();
      }

      if (!currentMetrics || currentMetrics.length === 0) {
        return getEmptyMetrics();
      }

      const current = currentMetrics[0];
      
      // Fetch previous period for comparison
      const daysDiff = differenceInDays(dateRange.to, dateRange.from) + 1;
      const prevPeriodEnd = subDays(dateRange.from, 1);
      const prevPeriodStart = subDays(prevPeriodEnd, daysDiff - 1);

      const { data: prevMetrics, error: prevError } = await supabase.rpc('get_dashboard_metrics', {
        p_start_date: formatDateForQuery(prevPeriodStart),
        p_end_date: formatDateForQuery(prevPeriodEnd)
      });

      if (prevError) {
        console.error("Error fetching previous period metrics:", prevError);
      }
      
      const previous = prevMetrics && prevMetrics.length > 0 ? prevMetrics[0] : null;
      
      // Calculate percentage changes
      const changes = calculateChanges(current, previous);
      
      // Generate chart data using SQL function with simplified parameters
      const { data: chartDataResults, error: chartError } = await supabase.rpc('get_sales_chart_data', {
        p_start_date: fromDate,
        p_end_date: toDate
      });

      if (chartError) {
        console.error("Error fetching chart data:", chartError);
      }

      const chartData = generateChartDataFromSQL(chartDataResults || []);
      
      // Fetch channel metrics using the new SQL function
      const { data: channelMetricsResults, error: channelMetricsError } = await supabase.rpc('get_channel_metrics', {
        p_start_date: fromDate,
        p_end_date: toDate
      });

      if (channelMetricsError) {
        console.error("Error fetching channel metrics:", channelMetricsError);
      }

      // Process channel metrics and calculate changes
      const channelMetrics = await processChannelMetrics(channelMetricsResults || [], dateRange);

      const result = {
        orderRevenue: Number(current.total_revenue || 0),
        contributionMargin: Number(current.total_profit || 0),
        marginPercentage: Number(current.margin_percentage || 0),
        orders: Number(current.total_orders || 0),
        aov: Number(current.aov || 0),
        
        // Customer metrics (simplified for now)
        returningRevenue: 0,
        returningOrders: 0,
        returningAOV: 0,
        repeatRate: 0,
        newCustomerRevenue: Number(current.total_revenue || 0), // Assume all are new for now
        newCustomerOrders: Number(current.total_orders || 0),
        newCustomerAOV: Number(current.aov || 0),
        cac: 0,
        
        // Paid performance metrics (not available without additional data)
        paidRevenue: 0,
        paidOrders: 0,
        paidAOV: 0,
        paidCAC: 0,
        pamer: 0,
        
        // Set defaults for metrics we can't calculate without additional data
        adSpend: 0,
        mer: 0,
        
        // Apply calculated changes
        ...changes,
        
        // Chart data and channel metrics
        chartData,
        channelMetrics,
        
        // Legacy metrics
        yesterdaySales: 0,
        unreconciled: 0,
        receivablesPending: 0,
        salesCount: Number(current.total_records || 0),
        unreconciledCount: 0,
        receivablesCount: 0
      };

      return result;

    } catch (error) {
      console.error("Error in fetchSalesMetrics:", error);
      toast.error("Error al cargar métricas del dashboard");
      return getEmptyMetrics();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processChannelMetrics = async (currentChannelData: any[], dateRange: DateRange): Promise<ChannelMetrics[]> => {
    if (!currentChannelData || currentChannelData.length === 0) {
      return [];
    }

    // Calculate previous period for comparison
    const daysDiff = differenceInDays(dateRange.to, dateRange.from) + 1;
    const prevPeriodEnd = subDays(dateRange.from, 1);
    const prevPeriodStart = subDays(prevPeriodEnd, daysDiff - 1);

    // Fetch previous period channel metrics
    const { data: prevChannelData, error: prevChannelError } = await supabase.rpc('get_channel_metrics', {
      p_start_date: formatDateForQuery(prevPeriodStart),
      p_end_date: formatDateForQuery(prevPeriodEnd)
    });

    if (prevChannelError) {
      console.error("Error fetching previous channel metrics:", prevChannelError);
    }

    // Create a map for quick lookup of previous data
    const prevDataMap = new Map();
    if (prevChannelData) {
      prevChannelData.forEach((item: any) => {
        prevDataMap.set(item.name, item);
      });
    }

    // Process current data and calculate changes
    const processedMetrics: ChannelMetrics[] = currentChannelData.map((current: any) => {
      const previous = prevDataMap.get(current.name);
      
      return {
        name: current.name,
        revenue: Number(current.revenue || 0),
        orders: Number(current.orders || 0),
        aov: Number(current.aov || 0),
        contributionMargin: Number(current.contribution_margin || 0),
        marginPercentage: Number(current.margin_percentage || 0),
        revenueChange: calculatePercentChange(Number(current.revenue || 0), Number(previous?.revenue || 0)),
        ordersChange: calculatePercentChange(Number(current.orders || 0), Number(previous?.orders || 0)),
        aovChange: calculatePercentChange(Number(current.aov || 0), Number(previous?.aov || 0)),
        contributionMarginChange: calculatePercentChange(Number(current.contribution_margin || 0), Number(previous?.contribution_margin || 0)),
        marginPercentageChange: calculatePercentChange(Number(current.margin_percentage || 0), Number(previous?.margin_percentage || 0))
      };
    });

    return processedMetrics;
  };

  const calculatePercentChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const calculateChanges = (current: any, previous: any | null) => {
    const calculatePercentChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

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

  const generateChartDataFromSQL = (sqlResults: any[]): ChartDataPoint[] => {
    return sqlResults.map(result => ({
      date: result.sale_date,
      sales: Number(result.daily_revenue || 0)
    })).sort((a, b) => a.date.localeCompare(b.date));
  };

  const getEmptyMetrics = (): DashboardMetrics => ({
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

  return { fetchSalesMetrics, isLoading };
};
