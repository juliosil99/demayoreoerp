
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { differenceInDays, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DashboardMetrics } from "@/types/dashboard";
import { formatDateForQuery } from "@/utils/dateUtils";
import { calculateChanges, getEmptyMetrics } from "./calculations";
import { processChannelMetrics, generateChartDataFromSQL } from "./dataProcessor";

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
      
      // Fetch current period metrics using SQL function
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
      
      // Generate chart data using SQL function
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

  return { fetchSalesMetrics, isLoading };
};
