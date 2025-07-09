
import { supabase } from "@/lib/supabase";
import { differenceInDays, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { ChannelMetrics, ChartDataPoint } from "@/types/dashboard";
import { formatDateForQuery } from "@/utils/dateUtils";
import { calculatePercentChange } from "./calculations";

export const processChannelMetrics = async (currentChannelData: any[], dateRange: DateRange): Promise<ChannelMetrics[]> => {
  if (!currentChannelData || currentChannelData.length === 0) {
    return [];
  }

  // Calculate previous period for comparison
  const daysDiff = differenceInDays(dateRange.to, dateRange.from) + 1;
  const prevPeriodEnd = subDays(dateRange.from, 1);
  const prevPeriodStart = subDays(prevPeriodEnd, daysDiff - 1);

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Fetch previous period channel metrics
  const { data: prevChannelData, error: prevChannelError } = await supabase.rpc('get_channel_metrics', {
    start_date: formatDateForQuery(prevPeriodStart),
    end_date: formatDateForQuery(prevPeriodEnd),
    p_user_id: user.id
  });

  if (prevChannelError) {
    console.error("Error fetching previous channel metrics:", prevChannelError);
  }

  // Create a map for quick lookup of previous data
  const prevDataMap = new Map();
  if (prevChannelData) {
    prevChannelData.forEach((item: any) => {
      prevDataMap.set(item.channel, item);
    });
  }

  // Process current data and calculate changes
  const processedMetrics: ChannelMetrics[] = currentChannelData.map((current: any) => {
    const previous = prevDataMap.get(current.channel);
    
    return {
      name: current.channel,
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

export const generateChartDataFromSQL = (sqlResults: any[]): ChartDataPoint[] => {
  return sqlResults.map(result => ({
    date: result.date,
    sales: Number(result.sales || 0)
  })).sort((a, b) => a.date.localeCompare(b.date));
};
