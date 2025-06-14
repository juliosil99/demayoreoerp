
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface OptimizedDashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProfit: number;
  aov: number;
  marginPercentage: number;
  totalRecords: number;
}

interface ChannelMetric {
  name: string;
  revenue: number;
  orders: number;
  aov: number;
  contributionMargin: number;
  marginPercentage: number;
}

interface ChartDataPoint {
  date: string;
  sales: number;
  orders: number;
}

interface ChannelDistribution {
  channel: string;
  uniqueOrders: number;
  totalRevenue: number;
  totalRecords: number;
}

export function useOptimizedDashboardMetrics(dateRange: DateRange | undefined) {
  const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
  const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null;

  // Optimized main metrics query using RPC function
  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['optimized-dashboard-metrics', startDate, endDate],
    queryFn: async (): Promise<OptimizedDashboardMetrics> => {
      const { data, error } = await supabase.rpc('get_dashboard_metrics', {
        p_start_date: startDate,
        p_end_date: endDate
      });

      if (error) throw error;
      
      const result = data?.[0];
      return {
        totalRevenue: Number(result?.total_revenue || 0),
        totalOrders: Number(result?.total_orders || 0),
        totalProfit: Number(result?.total_profit || 0),
        aov: Number(result?.aov || 0),
        marginPercentage: Number(result?.margin_percentage || 0),
        totalRecords: Number(result?.total_records || 0)
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  });

  // Optimized channel metrics query
  const { data: channelMetrics, isLoading: channelLoading } = useQuery({
    queryKey: ['optimized-channel-metrics', startDate, endDate],
    queryFn: async (): Promise<ChannelMetric[]> => {
      const { data, error } = await supabase.rpc('get_channel_metrics', {
        p_start_date: startDate,
        p_end_date: endDate
      });

      if (error) throw error;
      
      return data?.map((item: any) => ({
        name: item.name,
        revenue: Number(item.revenue),
        orders: Number(item.orders),
        aov: Number(item.aov),
        contributionMargin: Number(item.contribution_margin),
        marginPercentage: Number(item.margin_percentage)
      })) || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000,
  });

  // Optimized chart data query
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['optimized-sales-chart', startDate, endDate],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      const { data, error } = await supabase.rpc('get_sales_chart_data', {
        p_start_date: startDate,
        p_end_date: endDate
      });

      if (error) throw error;
      
      return data?.map((item: any) => ({
        date: item.sale_date,
        sales: Number(item.daily_revenue),
        orders: Number(item.daily_orders)
      })) || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000,
  });

  // Optimized channel distribution query
  const { data: channelDistribution, isLoading: distributionLoading } = useQuery({
    queryKey: ['optimized-channel-distribution', startDate, endDate],
    queryFn: async (): Promise<ChannelDistribution[]> => {
      const { data, error } = await supabase.rpc('get_channel_distribution', {
        p_start_date: startDate,
        p_end_date: endDate
      });

      if (error) throw error;
      
      return data?.map((item: any) => ({
        channel: item.channel,
        uniqueOrders: Number(item.unique_orders),
        totalRevenue: Number(item.total_revenue),
        totalRecords: Number(item.total_records)
      })) || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000,
  });

  const isLoading = metricsLoading || channelLoading || chartLoading || distributionLoading;

  return {
    metricsData,
    channelMetrics: channelMetrics || [],
    chartData: chartData || [],
    channelDistribution: channelDistribution || [],
    isLoading
  };
}
