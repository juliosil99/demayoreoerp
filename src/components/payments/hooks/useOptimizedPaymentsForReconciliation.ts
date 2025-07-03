import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { CACHE_CONFIGS, createOptimizedQueryKey } from "@/utils/queryOptimizations";

interface OptimizedPaymentForReconciliation {
  id: string;
  date: string;
  amount: number;
  reference_number: string | null;
  sales_channels: { name: string } | null;
}

export function useOptimizedPaymentsForReconciliation(selectedChannel: string) {
  const { measureQuery } = usePerformanceMonitor();

  const queryKey = createOptimizedQueryKey("optimized-payments-reconciliation", {
    selectedChannel
  });

  return useQuery({
    queryKey,
    queryFn: async () => {
      return measureQuery('payments-for-reconciliation-optimized', async () => {
        // Select only necessary columns
        const selectColumns = `
          id,
          date,
          amount,
          reference_number,
          sales_channels(name)
        `;

        let query = supabase
          .from("payments")
          .select(selectColumns)
          .eq("is_reconciled", false)
          .order("date", { ascending: false })
          .limit(100); // Limit to recent payments

        // Apply channel filter if not "all"
        if (selectedChannel !== "all") {
          query = query.eq("sales_channel_id", selectedChannel);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching payments for reconciliation:", error);
          throw error;
        }
        
        return data as OptimizedPaymentForReconciliation[];
      });
    },
    ...CACHE_CONFIGS.DYNAMIC,
    refetchOnWindowFocus: false,
  });
}