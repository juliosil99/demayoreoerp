
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function useAccountTransfersList() {
  const { user } = useAuth();
  
  const { data: transfers, isLoading: isLoadingTransfers } = useQuery({
    queryKey: ["account-transfers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("account_transfers")
        .select(`
          id, 
          date, 
          from_account_id, 
          to_account_id, 
          amount, 
          reference_number, 
          notes, 
          status,
          from_account:bank_accounts!fk_from_account(name),
          to_account:bank_accounts!account_transfers_to_account_id_fkey(name)
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return {
    transfers,
    isLoadingTransfers
  };
}
