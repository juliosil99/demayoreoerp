
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
  // Always call hooks in the same order - no conditional execution
  const { user } = useAuth();
  const { data: company, isLoading: isLoadingCompany } = useUserCompany();
  
  // Extract values to avoid undefined issues
  const userId = user?.id;
  const companyId = company?.id;

  // Always execute all hooks in the same order, regardless of data availability
  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts } = useQuery<BankAccount[], Error>({
    queryKey: ["bankAccounts", companyId],
    queryFn: async () => {
      console.log("Fetching bank accounts for company:", companyId);
      if (!companyId) {
        console.log("No company ID available, returning empty array");
        return [];
      }
      
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("company_id", companyId);
        
      if (error) {
        console.error("Error fetching bank accounts:", error);
        throw error;
      }
      
      console.log("Fetched bank accounts:", data?.length || 0);
      return data as BankAccount[];
    },
    enabled: Boolean(companyId), // Simplified boolean condition
    initialData: [],
  });

  const { data: chartAccounts = [], isLoading: isLoadingChartAccounts } = useQuery<ChartAccount[], Error>({
    queryKey: ["chartAccounts", userId],
    queryFn: async () => {
      console.log("Fetching chart accounts for user:", userId);
      if (!userId) {
        console.log("No user ID available, returning empty array");
        return [];
      }
      
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .eq("user_id", userId)
        .in("account_type", ["expense", "asset", "liability"])
        .order('code');
        
      if (error) {
        console.error("Error fetching chart accounts:", error);
        throw error;
      }
      
      console.log("Fetched chart accounts:", data?.length || 0);
      return data as ChartAccount[];
    },
    enabled: Boolean(userId), // Simplified boolean condition
    initialData: [],
  });

  const { data: recipients = [], isLoading: isLoadingRecipients } = useQuery<Recipient[], Error>({
    queryKey: ["expenseRecipients", userId],
    queryFn: async () => {
      console.log("Fetching recipients for user:", userId);
      if (!userId) {
        console.log("No user ID available, returning empty array");
        return [];
      }
      
      const { data, error } = await supabase
        .from("contacts")
        .select("id, name, type, rfc")
        .eq("user_id", userId)
        .in("type", ["supplier", "employee"])
        .order('name');
        
      if (error) {
        console.error("Error fetching recipients:", error);
        throw error;
      }
      
      const mappedData = data ? data.map(recipient => ({
        ...recipient,
        id: String(recipient.id)
      })) : [];
      
      console.log("Fetched recipients:", mappedData.length);
      return mappedData;
    },
    enabled: Boolean(userId), // Simplified boolean condition
    initialData: [],
  });

  // Calculate loading state
  const isLoading = isLoadingCompany || isLoadingBankAccounts || isLoadingChartAccounts || isLoadingRecipients;

  // Log current state for debugging
  console.log("useExpenseQueries state:", {
    userId,
    companyId,
    bankAccountsCount: bankAccounts.length,
    chartAccountsCount: chartAccounts.length,
    recipientsCount: recipients.length,
    isLoading
  });

  return {
    bankAccounts,
    chartAccounts,
    recipients,
    isLoading,
  };
}
