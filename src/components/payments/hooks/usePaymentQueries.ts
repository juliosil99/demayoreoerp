
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePaymentQueries() {
  const { user } = useAuth();

  const { data: bankAccounts, isLoading: bankAccountsLoading, error: bankAccountsError } = useQuery({
    queryKey: ["bankAccounts", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No authenticated user, skipping bank accounts query");
        return [];
      }
      console.log("Fetching bank accounts for user:", user.id);
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
    enabled: !!user?.id,
  });

  const { data: salesChannels, isLoading: salesChannelsLoading, error: salesChannelsError } = useQuery({
    queryKey: ["salesChannels", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No authenticated user, skipping sales channels query");
        return [];
      }
      console.log("Fetching sales channels for user:", user.id);
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
    enabled: !!user?.id,
  });

  return {
    bankAccounts,
    salesChannels,
    isLoading: bankAccountsLoading || salesChannelsLoading,
    error: bankAccountsError || salesChannelsError,
  };
}
