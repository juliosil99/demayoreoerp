
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/formatters";
import { Loader2 } from "lucide-react";

// Enhanced color palette with better contrast and visual appeal
const COLORS = [
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
const standardizeChannel = (channel: string | null): string => {
  if (!channel) return "Sin Canal";
  return channel.trim().charAt(0).toUpperCase() + channel.trim().slice(1).toLowerCase();
};

export const SalesChannelDistribution = () => {
  const { data: channelDistribution, isLoading, error } = useQuery({
    queryKey: ["salesChannelDistribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Sales")
        .select('Channel, price');
      
      if (error) {
        console.error("Error fetching sales data:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return [];
      }

      // Group and aggregate sales data by channel
      const channelGroups = data.reduce((acc: { [key: string]: { count: number, value: number } }, sale) => {
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
    }
  });

  if (isLoading) {
    return (
      <Card className="shadow-md transition-all hover:shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Distribución de Ventas por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("Error loading channel distribution data:", error);
    return (
      <Card className="shadow-md border-destructive/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Distribución de Ventas por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-destructive">Error al cargar los datos</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!channelDistribution || channelDistribution.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Distribución de Ventas por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">No hay datos de ventas por canal disponibles</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate the total value for the summary display
  const totalValue = channelDistribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="shadow-md transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Distribución de Ventas por Canal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelDistribution}
                  dataKey="value"
                  nameKey="channel"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={40}
                  paddingAngle={1}
                  cornerRadius={3}
                >
                  {channelDistribution?.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      stroke="transparent"
                      className="transition-opacity hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name, props: any) => [
                    `${formatCurrency(value)} (${props.payload.percentage}%)`,
                    props.payload.channel
                  ]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    padding: '8px 12px'
                  }}
                />
                <Legend 
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  formatter={(value, entry, index) => {
                    const item = channelDistribution?.[index];
                    return (
                      <span className="text-xs font-medium">
                        {value} ({item?.percentage}%)
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-sm text-center font-medium">
            Total: {formatCurrency(totalValue)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
