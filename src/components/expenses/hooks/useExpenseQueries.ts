
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BankAccount as BankAccountType } from "@/components/banking/types";
import { useAuth } from "@/contexts/AuthContext";
import { useUserCompany } from "@/hooks/useUserCompany";

export interface BankAccount extends BankAccountType {}

export interface ChartAccount {
  id: string;
  code: string;
  name: string;
  account_type: string;
}

export interface Recipient {
  id: string;
  name: string;
  type: string;
  rfc: string | null;
}

export function useExpenseQueries() {
  const { user } = useAuth();
  const { data: company, isLoading: isLoadingCompany, error: companyError } = useUserCompany();
  
  // Extract values to avoid undefined issues
  const userId = user?.id;
  const companyId = company?.id;

  // Always execute all hooks in the same order, regardless of data availability
  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts, error: bankAccountsError } = useQuery<BankAccount[], Error>({
    queryKey: ["bankAccounts", companyId],
    queryFn: async () => {
      if (!companyId) {
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from("bank_accounts")
          .select("*")
          .eq("company_id", companyId);
          
        if (error) {
          throw error;
        }
        
        return data as BankAccount[];
      } catch (err) {
        throw err;
      }
    },
    enabled: Boolean(companyId),
    initialData: [],
  });

  const { data: chartAccounts = [], isLoading: isLoadingChartAccounts, error: chartAccountsError } = useQuery<ChartAccount[], Error>({
    queryKey: ["chartAccounts", userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from("chart_of_accounts")
          .select("*")
          .eq("user_id", userId)
          .in("account_type", ["expense", "asset", "liability"])
          .order('code');
          
        if (error) {
          throw error;
        }
        
        return data as ChartAccount[];
      } catch (err) {
        throw err;
      }
    },
    enabled: Boolean(userId),
    initialData: [],
  });

  const { data: recipients = [], isLoading: isLoadingRecipients, error: recipientsError } = useQuery<Recipient[], Error>({
    queryKey: ["expenseRecipients", userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from("contacts")
          .select("id, name, type, rfc")
          .eq("user_id", userId)
          .in("type", ["supplier", "employee"])
          .order('name');
          
        if (error) {
          throw error;
        }
        
        const mappedData = data ? data.map(recipient => ({
          ...recipient,
          id: String(recipient.id)
        })) : [];
        
        return mappedData;
      } catch (err) {
        throw err;
      }
    },
    enabled: Boolean(userId),
    initialData: [],
  });

  // Calculate loading state
  const isLoading = isLoadingCompany || isLoadingBankAccounts || isLoadingChartAccounts || isLoadingRecipients;

  return {
    bankAccounts,
    chartAccounts,
    recipients,
    isLoading,
  };
}
