
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

  console.log("useExpenseQueries - userId:", userId);
  console.log("useExpenseQueries - companyId:", companyId);
  console.log("useExpenseQueries - isLoadingCompany:", isLoadingCompany);

  // Only fetch bank accounts when we have a company ID
  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts, error: bankAccountsError } = useQuery<BankAccount[], Error>({
    queryKey: ["bankAccounts", companyId],
    queryFn: async () => {
      console.log("Fetching bank accounts for company:", companyId);
      
      if (!companyId) {
        console.log("No company ID available for bank accounts query");
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from("bank_accounts")
          .select("*")
          .eq("company_id", companyId);
          
        if (error) {
          console.error("Error fetching bank accounts:", error);
          throw error;
        }
        
        console.log("Bank accounts fetched successfully:", data?.length || 0, "accounts");
        return data as BankAccount[];
      } catch (err) {
        console.error("Exception in bank accounts query:", err);
        throw err;
      }
    },
    enabled: Boolean(companyId), // Only run when we have a company ID
    initialData: [],
  });

  // Chart accounts query - depends on user ID
  const { data: chartAccounts = [], isLoading: isLoadingChartAccounts, error: chartAccountsError } = useQuery<ChartAccount[], Error>({
    queryKey: ["chartAccounts", userId],
    queryFn: async () => {
      console.log("Fetching chart accounts for user:", userId);
      
      if (!userId) {
        console.log("No user ID available for chart accounts query");
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
          console.error("Error fetching chart accounts:", error);
          throw error;
        }
        
        console.log("Chart accounts fetched successfully:", data?.length || 0, "accounts");
        return data as ChartAccount[];
      } catch (err) {
        console.error("Exception in chart accounts query:", err);
        throw err;
      }
    },
    enabled: Boolean(userId),
    initialData: [],
  });

  // Recipients query - depends on user ID
  const { data: recipients = [], isLoading: isLoadingRecipients, error: recipientsError } = useQuery<Recipient[], Error>({
    queryKey: ["expenseRecipients", userId],
    queryFn: async () => {
      console.log("Fetching recipients for user:", userId);
      
      if (!userId) {
        console.log("No user ID available for recipients query");
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
          console.error("Error fetching recipients:", error);
          throw error;
        }
        
        const mappedData = data ? data.map(recipient => ({
          ...recipient,
          id: String(recipient.id)
        })) : [];
        
        console.log("Recipients fetched successfully:", mappedData.length, "recipients");
        return mappedData;
      } catch (err) {
        console.error("Exception in recipients query:", err);
        throw err;
      }
    },
    enabled: Boolean(userId),
    initialData: [],
  });

  // Calculate comprehensive loading state
  const isLoading = isLoadingCompany || isLoadingBankAccounts || isLoadingChartAccounts || isLoadingRecipients;

  // Determine what data we're missing
  const missingData = [];
  if (isLoadingCompany) missingData.push("empresa");
  if (!companyId && !isLoadingCompany) missingData.push("configuración de empresa");
  if (isLoadingBankAccounts) missingData.push("cuentas bancarias");
  if (bankAccounts.length === 0 && !isLoadingBankAccounts && companyId) missingData.push("cuentas bancarias configuradas");
  if (isLoadingChartAccounts) missingData.push("plan contable");
  if (chartAccounts.length === 0 && !isLoadingChartAccounts && userId) missingData.push("cuentas contables configuradas");
  if (isLoadingRecipients) missingData.push("contactos");

  console.log("useExpenseQueries summary:");
  console.log("- isLoading:", isLoading);
  console.log("- bankAccounts count:", bankAccounts.length);
  console.log("- chartAccounts count:", chartAccounts.length);
  console.log("- recipients count:", recipients.length);
  console.log("- missingData:", missingData);

  return {
    bankAccounts,
    chartAccounts,
    recipients,
    isLoading,
    missingData,
    hasRequiredData: bankAccounts.length > 0 && chartAccounts.length > 0,
    errors: {
      company: companyError,
      bankAccounts: bankAccountsError,
      chartAccounts: chartAccountsError,
      recipients: recipientsError
    }
  };
}
