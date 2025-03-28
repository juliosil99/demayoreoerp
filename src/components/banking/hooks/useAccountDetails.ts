
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BankAccount, AccountType } from "@/components/banking/types";

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
      
      // Ensure the data is properly typed as BankAccount
      if (data) {
        const bankAccount: BankAccount = {
          id: data.id,
          name: data.name,
          type: data.type as AccountType,
          balance: data.balance || 0,
          initial_balance: data.initial_balance || 0,
          balance_date: data.balance_date || new Date().toISOString(),
          created_at: data.created_at || new Date().toISOString()
        };
        return bankAccount;
      }
      return null;
    },
    enabled: !!accountId,
  });
}
