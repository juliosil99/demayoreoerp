
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
  const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null;

  console.log('useOptimizedDashboardMetrics - Date Range:', { startDate, endDate });
  console.log('useOptimizedDashboardMetrics - User:', user?.id);

  // Optimized main metrics query using RPC function
  const { data: metricsData, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['optimized-dashboard-metrics', user?.id, startDate, endDate],
    queryFn: async (): Promise<OptimizedDashboardMetrics> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching dashboard metrics for user:', user.id, 'dates:', startDate, endDate);

      const { data, error } = await supabase.rpc('get_dashboard_metrics', {
        p_user_id: user.id,
        p_start_date: startDate,
        p_end_date: endDate
      });

      if (error) {
        console.error('Dashboard metrics error:', error);
        throw error;
      }
      
      console.log('Dashboard metrics RAW response:', data);
      const result = data?.[0];
      console.log('Dashboard metrics PROCESSED result:', result);
      
      const processedMetrics = {
        totalRevenue: Number(result?.order_revenue || 0),
        totalOrders: Number(result?.orders || 0),
        totalProfit: Number(result?.contribution_margin || 0),
        aov: Number(result?.aov || 0),
        marginPercentage: Number(result?.margin_percentage || 0),
        totalRecords: Number(result?.orders || 0)
      };
      
      console.log('Dashboard metrics FINAL processed:', processedMetrics);
      return processedMetrics;
    },
    enabled: !!(user?.id && startDate && endDate), // Only run when user is authenticated and dates are available
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    retry: 1, // Only retry once on error
  });

  // Optimized channel metrics query
  const { data: channelMetrics, isLoading: channelLoading } = useQuery({
    queryKey: ['optimized-channel-metrics', user?.id, startDate, endDate],
    queryFn: async (): Promise<ChannelMetric[]> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_channel_metrics', {
        p_user_id: user.id,
        p_start_date: startDate,
        p_end_date: endDate
      });

      if (error) {
        console.error('Channel metrics error:', error);
        throw error;
      }
      
      console.log('Channel metrics RAW response:', data);
      
      const processedChannels = data?.map((item: any) => {
        console.log('Processing channel item:', item);
        return {
          name: item.channel_name, // Fixed: was item.channel, should be item.channel_name
          revenue: Number(item.revenue),
          orders: Number(item.orders),
          aov: Number(item.aov),
          contributionMargin: Number(item.contribution_margin),
          marginPercentage: Number(item.margin_percentage)
        };
      }) || [];
      
      console.log('Channel metrics FINAL processed:', processedChannels);
      return processedChannels;
    },
    enabled: !!(user?.id && startDate && endDate),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  // Optimized chart data query
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['optimized-sales-chart', user?.id, startDate, endDate],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_sales_chart_data', {
        p_user_id: user.id,
        p_start_date: startDate,
        p_end_date: endDate
      });

      if (error) {
        console.error('Chart data error:', error);
        throw error;
      }
      
      console.log('Chart data RAW response:', data);
      
      const processedChart = data?.map((item: any) => ({
        date: item.date,
        sales: Number(item.sales),
        orders: 0 // Default since new function doesn't return orders
      })) || [];
      
      console.log('Chart data FINAL processed:', processedChart);
      return processedChart;
    },
    enabled: !!(user?.id && startDate && endDate),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  // Optimized channel distribution query
  const { data: channelDistribution, isLoading: distributionLoading } = useQuery({
    queryKey: ['optimized-channel-distribution', user?.id, startDate, endDate],
    queryFn: async (): Promise<ChannelDistribution[]> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_channel_distribution', {
        p_user_id: user.id,
        p_start_date: startDate,
        p_end_date: endDate
      });

      if (error) {
        console.error('Channel distribution error:', error);
        throw error;
      }
      
      console.log('Channel distribution RAW response:', data);
      
      const processedDistribution = data?.map((item: any) => ({
        channel: item.channel_name, // Fixed: should be channel_name not channel
        uniqueOrders: 0, // Default since new function doesn't return orders
        totalRevenue: Number(item.value),
        totalRecords: Number(item.percentage)
      })) || [];
      
      console.log('Channel distribution FINAL processed:', processedDistribution);
      return processedDistribution;
    },
    enabled: !!(user?.id && startDate && endDate),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const isLoading = metricsLoading || channelLoading || chartLoading || distributionLoading;

  console.log('useOptimizedDashboardMetrics FINAL RETURN:', {
    metricsData,
    channelMetrics: channelMetrics || [],
    chartData: chartData || [],
    channelDistribution: channelDistribution || [],
    isLoading
  });

  return {
    metricsData,
    channelMetrics: channelMetrics || [],
    chartData: chartData || [],
    channelDistribution: channelDistribution || [],
    isLoading
  };
}
