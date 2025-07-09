
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
  const { data: metricsData, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['optimized-dashboard-metrics', startDate, endDate],
    queryFn: async (): Promise<OptimizedDashboardMetrics> => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching dashboard metrics for user:', user.id, 'dates:', startDate, endDate);

      const { data, error } = await supabase.rpc('get_dashboard_metrics', {
        start_date: startDate,
        end_date: endDate,
        p_user_id: user.id
      });

      if (error) {
        console.error('Dashboard metrics error:', error);
        throw error;
      }
      
      console.log('Dashboard metrics response:', data);
      const result = data?.[0];
      return {
        totalRevenue: Number(result?.order_revenue || 0),
        totalOrders: Number(result?.orders || 0),
        totalProfit: Number(result?.contribution_margin || 0),
        aov: Number(result?.aov || 0),
        marginPercentage: Number(result?.margin_percentage || 0),
        totalRecords: Number(result?.orders || 0)
      };
    },
    enabled: !!(startDate && endDate), // Only run when dates are available
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    retry: 1, // Only retry once on error
  });

  // Optimized channel metrics query
  const { data: channelMetrics, isLoading: channelLoading } = useQuery({
    queryKey: ['optimized-channel-metrics', startDate, endDate],
    queryFn: async (): Promise<ChannelMetric[]> => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_channel_metrics', {
        start_date: startDate,
        end_date: endDate,
        p_user_id: user.id
      });

      if (error) {
        console.error('Channel metrics error:', error);
        throw error;
      }
      
      return data?.map((item: any) => ({
        name: item.channel,
        revenue: Number(item.revenue),
        orders: Number(item.orders),
        aov: Number(item.aov),
        contributionMargin: Number(item.contribution_margin),
        marginPercentage: Number(item.margin_percentage)
      })) || [];
    },
    enabled: !!(startDate && endDate),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  // Optimized chart data query
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['optimized-sales-chart', startDate, endDate],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_sales_chart_data', {
        start_date: startDate,
        end_date: endDate,
        p_user_id: user.id
      });

      if (error) {
        console.error('Chart data error:', error);
        throw error;
      }
      
      return data?.map((item: any) => ({
        date: item.date,
        sales: Number(item.sales),
        orders: 0 // Default since new function doesn't return orders
      })) || [];
    },
    enabled: !!(startDate && endDate),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  // Optimized channel distribution query
  const { data: channelDistribution, isLoading: distributionLoading } = useQuery({
    queryKey: ['optimized-channel-distribution', startDate, endDate],
    queryFn: async (): Promise<ChannelDistribution[]> => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_channel_distribution', {
        start_date: startDate,
        end_date: endDate,
        p_user_id: user.id
      });

      if (error) {
        console.error('Channel distribution error:', error);
        throw error;
      }
      
      return data?.map((item: any) => ({
        channel: item.channel,
        uniqueOrders: 0, // Default since new function doesn't return orders
        totalRevenue: Number(item.value),
        totalRecords: Number(item.percentage)
      })) || [];
    },
    enabled: !!(startDate && endDate),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000,
    retry: 1,
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
