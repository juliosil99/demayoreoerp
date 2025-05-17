
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface SkuSalesResult {
  sku: string;
  channel: string;
  quantity: number;
  revenue: number;
}

interface UseSkuChannelSalesProps {
  dateRange?: DateRange;
  sku?: string;
  channelId?: string;
}

export function useSkuChannelSales({ dateRange, sku, channelId }: UseSkuChannelSalesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SkuSalesResult[]>([]);

  const fetchSales = async (searchSku: string, searchChannelId?: string) => {
    if (!searchSku || !dateRange?.from) {
      toast.error("Por favor ingrese un SKU y seleccione un rango de fechas");
      return;
    }

    setIsLoading(true);

    try {
      let query = supabase
        .from("Sales")
        .select(`
          sku,
          Channel,
          price,
          Quantity
        `)
        .eq("sku", searchSku)
        .gte("date", dateRange.from.toISOString().split("T")[0]);

      if (dateRange.to) {
        query = query.lte("date", dateRange.to.toISOString().split("T")[0]);
      }

      if (searchChannelId && searchChannelId !== "all") {
        query = query.eq("Channel", searchChannelId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Process the results and group by channel
      const salesByChannel: Record<string, { quantity: number; revenue: number }> = {};

      data.forEach((sale) => {
        const channel = sale.Channel || "Sin canal";
        const quantity = sale.Quantity || 0;
        const price = sale.price || 0;
        const revenue = price * quantity;

        if (!salesByChannel[channel]) {
          salesByChannel[channel] = { quantity: 0, revenue: 0 };
        }

        salesByChannel[channel].quantity += quantity;
        salesByChannel[channel].revenue += revenue;
      });

      // Convert to array format for the component
      const formattedResults: SkuSalesResult[] = Object.keys(salesByChannel).map((channel) => ({
        sku: searchSku,
        channel,
        quantity: salesByChannel[channel].quantity,
        revenue: salesByChannel[channel].revenue,
      }));

      setResults(formattedResults);
    } catch (error) {
      console.error("Error fetching SKU sales:", error);
      toast.error("Error al buscar ventas por SKU");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, results, fetchSales };
}
