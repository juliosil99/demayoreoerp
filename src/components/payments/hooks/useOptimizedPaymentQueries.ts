import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { CACHE_CONFIGS } from "@/utils/queryOptimizations";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();

  const { data: bankAccounts, isLoading: bankAccountsLoading, error: bankAccountsError } = useQuery({
    queryKey: ["optimized-bank-accounts", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No authenticated user, skipping optimized bank accounts query");
        return [];
      }
      return measureQuery('bank-accounts-minimal', async () => {
        console.log("Fetching optimized bank accounts for user:", user.id);
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
    enabled: !!user?.id,
  });

  const { data: salesChannels, isLoading: salesChannelsLoading, error: salesChannelsError } = useQuery({
    queryKey: ["optimized-sales-channels", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No authenticated user, skipping optimized sales channels query");
        return [];
      }
      return measureQuery('sales-channels-minimal', async () => {
        console.log("Fetching optimized sales channels for user:", user.id);
        const { data, error } = await supabase
          .from("sales_channels")
          .select("id, name")
          .eq("is_active", true);
        
        if (error) {
          console.error("Error fetching sales channels:", error);
          throw error;
        }
        
        console.log("Optimized sales channels data:", data);
        
        // Transform for reconciliation filters
        const transformedData = data?.map(channel => ({
          value: channel.id,
          label: channel.name
        })) || [];
        
        console.log("Optimized transformed sales channels:", transformedData);
        return transformedData as OptimizedSalesChannel[];
      });
    },
    ...CACHE_CONFIGS.STATIC,
    refetchOnWindowFocus: false,
    enabled: !!user?.id,
  });

  return {
    bankAccounts,
    salesChannels,
    isLoading: bankAccountsLoading || salesChannelsLoading,
    error: bankAccountsError || salesChannelsError,
  };
}