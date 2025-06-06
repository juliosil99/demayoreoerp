
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
  console.log('=== PROCESSING CHANNEL DATA DEBUG ===');
  
  if (!salesData || salesData.length === 0) {
    console.log('No sales data provided to processChannelData');
    return [];
  }

  console.log('Total sales records to process:', salesData.length);

  // Group by channel and collect unique orders with their total values
  const channelGroups: { [key: string]: { uniqueOrders: Set<string>, totalValue: number, allRecords: SalesBase[] } } = {};

  salesData.forEach((sale, index) => {
    const channel = standardizeChannel(sale.Channel);
    const orderNumber = sale.orderNumber || `no-order-${Math.random()}`;
    const price = sale.price || 0;

    if (!channelGroups[channel]) {
      channelGroups[channel] = {
        uniqueOrders: new Set<string>(),
        totalValue: 0,
        allRecords: []
      };
    }

    // Store all records for debugging
    channelGroups[channel].allRecords.push(sale);
    
    // Add the order number to the set (automatically handles duplicates)
    channelGroups[channel].uniqueOrders.add(orderNumber);
    // Sum all sales values for the channel
    channelGroups[channel].totalValue += price;
    
    // Log detailed info for Mercado Libre
    if (channel.toLowerCase().includes('mercado') && index < 20) {
      console.log(`Mercado record ${index + 1}:`, {
        channel,
        orderNumber,
        price,
        originalChannel: sale.Channel
      });
    }
  });

  // Detailed logging for each channel
  Object.entries(channelGroups).forEach(([channel, data]) => {
    console.log(`Channel: ${channel}`);
    console.log(`  - Total records: ${data.allRecords.length}`);
    console.log(`  - Unique orders: ${data.uniqueOrders.size}`);
    console.log(`  - Total value: ${data.totalValue}`);
    
    if (channel.toLowerCase().includes('mercado')) {
      console.log(`  - Mercado Libre detailed analysis:`);
      console.log(`    - All order numbers:`, Array.from(data.uniqueOrders).slice(0, 20));
      console.log(`    - Records with null orderNumber:`, 
        data.allRecords.filter(r => !r.orderNumber).length
      );
      console.log(`    - Sample records:`, data.allRecords.slice(0, 10));
    }
  });

  // Convert to array format with unique order counts
  const sortedChannels = Object.entries(channelGroups)
    .map(([channel, data]) => ({
      channel,
      count: data.uniqueOrders.size, // Number of unique orders
      value: data.totalValue // Total sales value for the channel
    }))
    .sort((a, b) => b.value - a.value);

  console.log('Sorted channels before grouping "Otros":', sortedChannels);

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
  const result = topChannels.map(channel => ({
    ...channel,
    percentage: ((channel.value / totalValue) * 100).toFixed(1)
  }));

  console.log('Final processed channel data:', result);
  console.log('=== PROCESSING CHANNEL DATA DEBUG END ===');
  
  return result;
};

export const calculateTotalValue = (channelData: ChannelData[]): number => {
  return channelData.reduce((sum, item) => sum + item.value, 0);
};
