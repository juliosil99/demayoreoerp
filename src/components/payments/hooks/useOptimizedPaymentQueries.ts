import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { CACHE_CONFIGS } from "@/utils/queryOptimizations";

interface OptimizedBankAccount {
  id: number;
  name: string;
  type: string;
  currency: string;
}

interface OptimizedSalesChannel {
  value: string;
  label: string;
}

export function useOptimizedPaymentQueries() {
  const { measureQuery } = usePerformanceMonitor();

  const { data: bankAccounts, isLoading: bankAccountsLoading, error: bankAccountsError } = useQuery({
    queryKey: ["optimized-bank-accounts"],
    queryFn: async () => {
      return measureQuery('bank-accounts-minimal', async () => {
        const { data, error } = await supabase
          .from("bank_accounts")
          .select("id, name, type, currency");
        
        if (error) {
          console.error("Error fetching bank accounts:", error);
          throw error;
        }
        
        return data as OptimizedBankAccount[];
      });
    },
    ...CACHE_CONFIGS.STATIC,
    refetchOnWindowFocus: false,
  });

  const { data: salesChannels, isLoading: salesChannelsLoading, error: salesChannelsError } = useQuery({
    queryKey: ["optimized-sales-channels"],
    queryFn: async () => {
      return measureQuery('sales-channels-minimal', async () => {
        const { data, error } = await supabase
          .from("sales_channels")
          .select("id, name")
          .eq("is_active", true);
        
        if (error) {
          console.error("Error fetching sales channels:", error);
          throw error;
        }
        
        // Transform for reconciliation filters
        const transformedData = data?.map(channel => ({
          value: channel.id,
          label: channel.name
        })) || [];
        
        return transformedData as OptimizedSalesChannel[];
      });
    },
    ...CACHE_CONFIGS.STATIC,
    refetchOnWindowFocus: false,
  });

  return {
    bankAccounts,
    salesChannels,
    isLoading: bankAccountsLoading || salesChannelsLoading,
    error: bankAccountsError || salesChannelsError,
  };
}