
import * as React from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { addDays, format } from "date-fns";
import { Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChannelIncomeStatementProps {
  userId?: string;
}

interface ChannelData {
  Channel: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

export function ChannelIncomeStatement({ userId }: ChannelIncomeStatementProps) {
  const isMobile = useIsMobile();
  const [loading, setLoading] = React.useState(false);
  const [date, setDate] = React.useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const { data: channelData, refetch: generateReport } = useQuery({
    queryKey: ["channel-income-statement", date.from, date.to],
    queryFn: async () => {
      if (!userId || !date.from || !date.to) return null;

      const { data: salesData, error } = await supabase
        .from("Sales")
        .select("Channel, price, cost")
        .gte("date", format(date.from, "yyyy-MM-dd"))
        .lte("date", format(date.to, "yyyy-MM-dd"))
        .not("Channel", "is", null);

      if (error) throw error;

      // Group and calculate totals by channel
      const channelMap = new Map<string, ChannelData>();
      
      salesData?.forEach((sale) => {
        const channel = sale.Channel || "Sin Canal";
        const currentData = channelMap.get(channel) || {
          Channel: channel,
          revenue: 0,
          cost: 0,
          profit: 0,
          margin: 0,
        };

        currentData.revenue += sale.price || 0;
        currentData.cost += sale.cost || 0;
        currentData.profit = currentData.revenue - currentData.cost;
        currentData.margin = currentData.revenue > 0 
          ? (currentData.profit / currentData.revenue) * 100 
          : 0;

        channelMap.set(channel, currentData);
      });

      return Array.from(channelMap.values());
    },
    enabled: false,
  });

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      await generateReport();
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const totalRevenue = channelData?.reduce((sum, channel) => sum + channel.revenue, 0) || 0;
  const totalProfit = channelData?.reduce((sum, channel) => sum + channel.profit, 0) || 0;
  const averageMargin = channelData?.length 
    ? (totalProfit / totalRevenue) * 100 
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="w-full sm:w-auto">
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
        <Button 
          onClick={handleGenerateReport} 
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generar Reporte
        </Button>
      </div>
      <div className="min-h-[400px] p-2 sm:p-4 border rounded-lg">
        {!channelData ? (
          <p className="text-center text-muted-foreground">
            Seleccione un rango de fechas y genere el reporte
          </p>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-3 sm:py-4">
                <CardTitle className="text-sm sm:text-base">Resumen Total</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Ventas Totales</p>
                    <p className="text-base sm:text-xl font-bold">{formatAmount(totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ganancia Total</p>
                    <p className="text-base sm:text-xl font-bold">{formatAmount(totalProfit)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Margen Promedio</p>
                    <p className="text-base sm:text-xl font-bold">{formatPercentage(averageMargin)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {channelData.map((channel) => (
              <Card key={channel.Channel}>
                <CardHeader className="py-2 sm:py-3">
                  <CardTitle className="text-sm sm:text-base">{channel.Channel}</CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-3 sm:p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Ventas</p>
                      <p className="text-xs sm:text-base font-semibold">{formatAmount(channel.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Costo</p>
                      <p className="text-xs sm:text-base font-semibold text-red-500">
                        ({formatAmount(channel.cost)})
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ganancia</p>
                      <p className={`text-xs sm:text-base font-semibold ${
                        channel.profit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatAmount(channel.profit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Margen</p>
                      <p className="text-xs sm:text-base font-semibold">
                        {formatPercentage(channel.margin)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
