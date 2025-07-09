
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChannelData } from "./utils";
import { DateRange } from "react-day-picker";
import { formatDateForQuery } from "@/utils/dateUtils";

export const useChannelDistributionData = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ["salesChannelDistribution", dateRange?.from, dateRange?.to],
    queryFn: async () => {
      let fromDate = null;
      let toDate = null;
      
      // Apply date filters if provided using local timezone
      if (dateRange?.from) {
        fromDate = formatDateForQuery(dateRange.from);
      }
      
      if (dateRange?.to) {
        toDate = formatDateForQuery(dateRange.to);
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Call the SQL function with parameters in correct order
      const { data, error } = await supabase.rpc('get_channel_distribution', {
        start_date: fromDate,
        end_date: toDate,
        p_user_id: user.id
      });
      
      if (error) {
        console.error("Error fetching channel distribution data:", error);
        throw error;
      }
      
      // Process the SQL results into the expected format
      const processedData = processChannelSQLResults(data || []);
      
      return processedData;
    },
    staleTime: 3 * 60 * 1000, // 3 minutos de cache para distribución de canales
    gcTime: 10 * 60 * 1000, // 10 minutos en garbage collection
    refetchOnMount: false, // No refetch al montar si hay datos en cache
    retry: 2
  });
};

// Process SQL function results into the expected ChannelData format
const processChannelSQLResults = (sqlResults: any[]): ChannelData[] => {
  if (!sqlResults || sqlResults.length === 0) {
    return [];
  }

  // Convert SQL results to ChannelData format (using new RPC format)
  const channelData = sqlResults.map(result => ({
    channel: result.channel || "Sin Canal",
    count: 0, // New RPC doesn't return order count
    value: Number(result.value || 0)
  }));

  // Take top 6 channels and group the rest as "Otros"
  const topChannels = channelData.slice(0, 6);
  const otherChannels = channelData.slice(6);
  
  if (otherChannels.length > 0) {
    const otherTotal = otherChannels.reduce(
      (sum, channel) => ({
        count: sum.count + channel.count,
        value: sum.value + channel.value
      }),
      { count: 0, value: 0 }
    );
    
    topChannels.push({
      channel: "Otros Canales",
      count: otherTotal.count,
      value: otherTotal.value
    });
  }

  // Calculate percentages based on total value
  const totalValue = channelData.reduce((sum, channel) => sum + channel.value, 0);
  const result = topChannels.map(channel => ({
    ...channel,
    percentage: totalValue > 0 ? ((channel.value / totalValue) * 100).toFixed(1) : "0.0"
  }));

  return result;
};
