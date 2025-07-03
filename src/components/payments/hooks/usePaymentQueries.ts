
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePaymentQueries() {
  const { data: bankAccounts, isLoading: bankAccountsLoading, error: bankAccountsError } = useQuery({
    queryKey: ["bankAccounts"],
    queryFn: async () => {
      console.log("Fetching bank accounts...");
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*");
      if (error) {
        console.error("Error fetching bank accounts:", error);
        throw error;
      }
      console.log("Bank accounts fetched:", data);
      return data;
    },
  });

  const { data: salesChannels, isLoading: salesChannelsLoading, error: salesChannelsError } = useQuery({
    queryKey: ["salesChannels"],
    queryFn: async () => {
      console.log("Fetching sales channels...");
      const { data, error } = await supabase
        .from("sales_channels")
        .select("*")
        .eq("is_active", true);
      if (error) {
        console.error("Error fetching sales channels:", error);
        throw error;
      }
      console.log("Raw sales channels data:", data);
      
      // Transform data to the format expected by ReconciliationFilters
      const transformedData = data?.map(channel => ({
        value: channel.id,
        label: channel.name
      })) || [];
      
      console.log("Transformed sales channels:", transformedData);
      return transformedData;
    },
  });

  return {
    bankAccounts,
    salesChannels,
    isLoading: bankAccountsLoading || salesChannelsLoading,
    error: bankAccountsError || salesChannelsError,
  };
}
