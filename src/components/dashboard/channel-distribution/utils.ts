
import { SalesBase } from "@/integrations/supabase/types/sales";

// Enhanced color palette with better contrast and visual appeal
export const CHANNEL_CHART_COLORS = [
  '#7E69AB', // Primary color (slightly different from state chart)
  '#9b87f5', // Secondary color
  '#0EA5E9', // Blue
  '#F97316', // Orange
  '#D946EF', // Magenta
  '#8B5CF6', // Violet
  '#10B981', // Green
  '#403E43'  // Dark gray
];

// Standardize channel name formatting
export const standardizeChannel = (channel: string | null): string => {
  if (!channel) return "Sin Canal";
  return channel.trim().charAt(0).toUpperCase() + channel.trim().slice(1).toLowerCase();
};

export interface ChannelData {
  channel: string;
  count: number;
  value: number;
  percentage?: string;
}

export const processChannelData = (salesData: SalesBase[]): ChannelData[] => {
  if (!salesData || salesData.length === 0) {
    return [];
  }

  // Group and aggregate sales data by channel
  const channelGroups = salesData.reduce((acc: { [key: string]: { count: number, value: number } }, sale) => {
    const channel = standardizeChannel(sale.Channel);
    if (!acc[channel]) {
      acc[channel] = { count: 0, value: 0 };
    }
    acc[channel].count += 1;
    acc[channel].value += sale.price || 0;
    return acc;
  }, {});

  // Convert to array and sort by value
  const sortedChannels = Object.entries(channelGroups)
    .map(([channel, data]) => ({
      channel,
      count: data.count,
      value: data.value
    }))
    .sort((a, b) => b.value - a.value);

  // Take top 6 channels and group the rest as "Otros"
  const topChannels = sortedChannels.slice(0, 6);
  const otherChannels = sortedChannels.slice(6);
  
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
  const totalValue = sortedChannels.reduce((sum, channel) => sum + channel.value, 0);
  return topChannels.map(channel => ({
    ...channel,
    percentage: ((channel.value / totalValue) * 100).toFixed(1)
  }));
};

export const calculateTotalValue = (channelData: ChannelData[]): number => {
  return channelData.reduce((sum, item) => sum + item.value, 0);
};
