
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BankAccount, AccountType, AccountCurrency } from "@/components/banking/types";

export function useAccountDetails(accountId: number | null) {
  return useQuery({
    queryKey: ["bank-account", accountId],
    queryFn: async () => {
      console.log('useAccountDetails - Starting query for accountId:', accountId);
      
      if (!accountId || accountId <= 0) {
        console.log('useAccountDetails - Invalid accountId, returning null');
        return null;
      }
      
      try {
        const { data, error } = await supabase
          .from("bank_accounts")
          .select("*")
          .eq("id", accountId)
          .single();
          
        if (error) {
          console.error('useAccountDetails - Supabase error:', error);
          throw error;
        }
        
        console.log('useAccountDetails - Raw data from Supabase:', data);
        
        // Ensure the data is properly typed as BankAccount
        if (data) {
          const bankAccount: BankAccount = {
            id: data.id,
            name: data.name,
            type: data.type as AccountType,
            balance: data.balance || 0,
            initial_balance: data.initial_balance || 0,
            balance_date: data.balance_date || new Date().toISOString(),
            created_at: data.created_at || new Date().toISOString(),
            currency: data.currency as AccountCurrency || "MXN"
          };
          console.log('useAccountDetails - Transformed bank account:', bankAccount);
          return bankAccount;
        }
        
        console.log('useAccountDetails - No data found');
        return null;
      } catch (error) {
        console.error('useAccountDetails - Query error:', error);
        throw error;
      }
    },
    enabled: !!accountId && accountId > 0,
    // Add refetching options to ensure we always have the latest data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0 // Consider data stale immediately
  });
}
