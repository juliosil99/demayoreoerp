
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

  // Group by channel and collect unique orders with their total values
  const channelGroups: { [key: string]: { uniqueOrders: Set<string>, totalValue: number } } = {};

  salesData.forEach(sale => {
    const channel = standardizeChannel(sale.Channel);
    const orderNumber = sale.orderNumber || `no-order-${Math.random()}`;
    const price = sale.price || 0;

    if (!channelGroups[channel]) {
      channelGroups[channel] = {
        uniqueOrders: new Set<string>(),
        totalValue: 0
      };
    }

    // Add the order number to the set (automatically handles duplicates)
    channelGroups[channel].uniqueOrders.add(orderNumber);
    // Sum all sales values for the channel
    channelGroups[channel].totalValue += price;
  });

  // Convert to array format with unique order counts
  const sortedChannels = Object.entries(channelGroups)
    .map(([channel, data]) => ({
      channel,
      count: data.uniqueOrders.size, // Number of unique orders
      value: data.totalValue // Total sales value for the channel
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
