
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAccountDetails(accountId: number | null) {
  return useQuery({
    queryKey: ["bank-account", accountId],
    queryFn: async () => {
      if (!accountId) return null;
      
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("id", accountId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!accountId,
  });
}
