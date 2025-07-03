import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { CACHE_CONFIGS, createOptimizedQueryKey } from "@/utils/queryOptimizations";
import type { UnreconciledSale } from "../types/UnreconciledSale";

interface UseOptimizedUnreconciledSalesParams {
  selectedChannel: string;
  selectedPaymentMethod: string;
  enabled: boolean;
}

export function useOptimizedUnreconciledSales({
  selectedChannel,
  selectedPaymentMethod,
  enabled
}: UseOptimizedUnreconciledSalesParams) {
  const { measureQuery } = usePerformanceMonitor();

  const queryKey = createOptimizedQueryKey("optimized-unreconciled-sales", {
    selectedChannel,
    selectedPaymentMethod
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
          shipping,
          payment_method
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

        // Apply payment method filter
        if (selectedPaymentMethod !== "all") {
          query = query.eq("payment_method", selectedPaymentMethod);
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