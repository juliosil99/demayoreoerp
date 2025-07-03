import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { CACHE_CONFIGS, createOptimizedQueryKey } from "@/utils/queryOptimizations";
import { formatDateForQuery } from "@/utils/dateUtils";
import type { UnreconciledSale } from "../types/UnreconciledSale";

interface UseOptimizedUnreconciledSalesParams {
  selectedChannel: string;
  orderNumbers: string;
  dateRange?: DateRange;
  enabled: boolean;
}

export function useOptimizedUnreconciledSales({
  selectedChannel,
  orderNumbers,
  dateRange,
  enabled
}: UseOptimizedUnreconciledSalesParams) {
  const { measureQuery } = usePerformanceMonitor();

  const queryKey = createOptimizedQueryKey("optimized-unreconciled-sales", {
    selectedChannel,
    orderNumbers,
    dateRange: dateRange ? {
      from: dateRange.from?.toISOString(),
      to: dateRange.to?.toISOString()
    } : null
  });

  return useQuery({
    queryKey,
    queryFn: async () => {
      return measureQuery('unreconciled-sales-optimized', async () => {
        // Select only necessary columns
        const selectColumns = `
          id,
          date,
          Channel,
          orderNumber,
          price,
          productName,
          comission,
          retention,
          shipping
        `;

        let query = supabase
          .from("Sales")
          .select(selectColumns)
          .is("reconciliation_id", null);

        // Apply channel filter efficiently
        if (selectedChannel !== "all") {
          // Get channel name from cache or direct query
          const { data: channelData } = await supabase
            .from("sales_channels")
            .select("name")
            .eq("id", selectedChannel)
            .single();
          
          if (channelData?.name) {
            query = query.eq("Channel", channelData.name);
          }
        }

        // Apply order numbers filter
        if (orderNumbers) {
          const orderNumbersList = orderNumbers
            .split(",")
            .map((num) => num.trim())
            .filter(Boolean);
          
          if (orderNumbersList.length > 0) {
            query = query.in("orderNumber", orderNumbersList);
          }
        }

        // Apply date range filter
        if (dateRange?.from) {
          query = query.gte("date", formatDateForQuery(dateRange.from));
        }
        if (dateRange?.to) {
          query = query.lte("date", formatDateForQuery(dateRange.to));
        }

        const { data, error } = await query
          .order("date", { ascending: false })
          .limit(1000); // Limit results to prevent excessive egress

        if (error) {
          console.error("Error fetching unreconciled sales:", error);
          throw error;
        }
        
        return data as unknown as UnreconciledSale[];
      });
    },
    ...CACHE_CONFIGS.DYNAMIC,
    refetchOnWindowFocus: false,
    enabled,
  });
}