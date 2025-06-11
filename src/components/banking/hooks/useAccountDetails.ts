
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BankAccount, AccountType, AccountCurrency } from "@/components/banking/types";
import { useUserCompany } from "@/hooks/useUserCompany";

export function useAccountDetails(accountId: number | null) {
  const { data: userCompany } = useUserCompany();
  
  return useQuery({
    queryKey: ["bank-account", accountId, userCompany?.id],
    queryFn: async () => {
      console.log('🔍 useAccountDetails - Starting query for accountId:', accountId, 'company:', userCompany?.id);
      
      if (!accountId || accountId <= 0) {
        console.log('❌ useAccountDetails - Invalid accountId, returning null');
        return null;
      }
      
      if (!userCompany?.id) {
        console.log('❌ useAccountDetails - No user company found, returning null');
        return null;
      }
      
      try {
        console.log('🔄 useAccountDetails - Querying bank_accounts table...');
        const { data, error } = await supabase
          .from("bank_accounts")
          .select("*")
          .eq("id", accountId)
          .single();
          
        if (error) {
          console.error('❌ useAccountDetails - Supabase error:', error);
          throw error;
        }
        
        console.log('✅ useAccountDetails - Raw data from Supabase:', data);
        
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
            currency: data.currency as AccountCurrency || "MXN",
            company_id: data.company_id,
            // Credit card specific fields
            payment_due_day: data.payment_due_day,
            statement_cut_day: data.statement_cut_day,
            credit_limit: data.credit_limit,
            minimum_payment_percentage: data.minimum_payment_percentage,
            // Loan specific fields
            monthly_payment: data.monthly_payment,
            total_term_months: data.total_term_months,
            remaining_months: data.remaining_months,
            original_loan_amount: data.original_loan_amount,
            loan_start_date: data.loan_start_date,
            // Common credit field
            interest_rate: data.interest_rate
          };
          console.log('✅ useAccountDetails - Transformed bank account:', bankAccount);
          return bankAccount;
        }
        
        console.log('❌ useAccountDetails - No data found');
        return null;
      } catch (error) {
        console.error('❌ useAccountDetails - Query error:', error);
        throw error;
      }
    },
    enabled: !!accountId && accountId > 0 && !!userCompany?.id,
    // Add refetching options to ensure we always have the latest data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0 // Consider data stale immediately
  });
}
