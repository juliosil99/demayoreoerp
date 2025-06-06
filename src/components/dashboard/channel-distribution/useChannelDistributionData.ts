
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
      
      // Call the SQL function with simplified parameters
      const { data, error } = await supabase.rpc('get_channel_distribution', {
        p_start_date: fromDate,
        p_end_date: toDate
      });
      
      if (error) {
        console.error("Error fetching channel distribution data:", error);
        throw error;
      }
      
      // Process the SQL results into the expected format
      const processedData = processChannelSQLResults(data || []);
      
      return processedData;
    }
  });
};

// Process SQL function results into the expected ChannelData format
const processChannelSQLResults = (sqlResults: any[]): ChannelData[] => {
  if (!sqlResults || sqlResults.length === 0) {
    return [];
  }

  // Convert SQL results to ChannelData format
  const channelData = sqlResults.map(result => ({
    channel: result.channel || "Sin Canal",
    count: Number(result.unique_orders || 0),
    value: Number(result.total_revenue || 0)
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
