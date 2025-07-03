
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePaymentQueries() {
  const { data: bankAccounts } = useQuery({
    queryKey: ["bankAccounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: salesChannels } = useQuery({
    queryKey: ["salesChannels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_channels")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      // Transform data to the format expected by ReconciliationFilters
      return data?.map(channel => ({
        value: channel.id,
        label: channel.name
      })) || [];
    },
  });

  return {
    bankAccounts,
    salesChannels,
  };
}
